// import type { HttpContext } from '@adonisjs/core/http'

import type { HttpContext } from '@adonisjs/core/http'
import { scrapeAllWorks, scrapeImagesFromUrl } from '#services/scrapeAllWorks'
import Work from '#models/work'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
export const phenixConfig = {
  root: 'https://phenix-scans.com',
  listPath: '/manga/',
  selectors: {
    card: 'div.manga-list__card',
    link: 'a.manga-list__link',
    title: '.manga-list__card-title',
    img: 'img',
    loadMore: 'div.manga-list__load-more > button, button.btn-load-more, button.series-load-more',
    nextPage: 'a[rel="next"], a.page-numbers.next',
  },
  chapterSelectors: {
    chapter: 'li.wp-manga-chapter, a.project__chapter',
    loadMore: 'button.project__chapter-load-more, button.btn-load-more',
  },
  limit: 10, // ← jusqu’à 60 séries
  parallelChunks: 5,
} as const

/* scanMangaConfig.ts
   ———————————————————————————————————————————————————————— */
export const scanMangaConfig = {
  root: 'https://www.scan-manga.com',
  listPath: '/',

  /* — LISTE — */
  selectors: {
    /* carte + infos */
    card: 'article.top_body',
    link: 'span.left > a.hover_text_manga',
    title: 'span.left > a.hover_text_manga',
    img: 'div.logo_manga img, div.image_manga.image_listing img',

    /* boutons / pagination */
    loadMore: '#seemorepub',
    nextPage: '',

    /* dernier chapitre indiqué sur la carte              */
    latestChapter: 'span.left', // ⬅️  Nouveau + obligé pour “quick”
  },

  /* — PAGE CHAPITRES — */
  chapterSelectors: {
    /* sur Scan-Manga, tous les liens de la table #listing suffisent */
    chapter: '#listing a', // couvre VO + VF
    loadMore: '', // il n’y en a pas
  },

  /* — OPTIONS — */
  limit: 10,
  parallelChunks: 5,
} as const

export default class WorksController {
  public async countChapters({ request, response }: HttpContext) {
    const mangaUrl = request.input('url')

    /* ---------- Mode 1 : une seule série --------------------------------- */
    // if (typeof mangaUrl === 'string' && mangaUrl.trim() !== '') {
    //   try {
    //     const chapters = await scrapeChapterCount({
    //       url: mangaUrl,
    //       selectors: phenixConfig.chapterSelectors, // ← tes sélecteurs chapitres
    //       // firstChapterTimeout: 15_000,           // optionnel, valeur par défaut
    //     })
    //
    //     return response.ok({ url: mangaUrl, chapters })
    //   } catch (err) {
    //     console.error('❌ Scrape error (single)', err)
    //     return response.status(500).json({ message: 'Scraping failed' })
    //   }
    // }

    /* ---------- Mode 2 : catalogue complet -------------------------------- */
    try {
      console.log('🔄 Scraping all works from ' + scanMangaConfig.root)
      const works = await scrapeAllWorks(scanMangaConfig)
      return response.ok(works)
    } catch (err) {
      console.error('❌ Scrape error (all works)', err)
      return response.status(500).json({ message: 'Scraping failed' })
    }
  }

  public async searchManga({ request, response }: HttpContext) {
    const q = (request.input('query', '') as string).trim()
    if (!q) return response.badRequest({ message: 'Aucune requête fournie.' })

    const tokens = q.toLowerCase().split(/\s+/).filter(t => t.length >= 3)

    const phraseMaxEdits = q.length <= 6 ? 2 : q.length <= 12 ? 3 : 4
    const phraseSim = q.length < 5 ? 0.6 : 0.45

    const rows = await db
      .from('works')
      .select('*')
      // 1) préfiltre sur la phrase complète
      .whereRaw('similarity(lower(title), lower(?)) > ?', [q, phraseSim])
      .orWhereILike('title', `%${q}%`)
      // 2) chaque token doit matcher (empêche “One” si tu tapes “One pice”)
      .andWhere((qb) => {
        tokens.forEach((t) => {
          const tMax = t.length <= 5 ? 1 : 2
          qb.andWhere((q2) => {
            q2.whereILike('title', `%${t}%`)
              .orWhereRaw('similarity(lower(title), ?) > 0.35', [t])
              .orWhereRaw(
                `EXISTS (
                 SELECT 1
                 FROM unnest(regexp_split_to_array(lower(title), E'\\s+')) w
                 WHERE levenshtein_less_equal(w, ?, ?) <= ?
               )`,
                [t, tMax, tMax]
              )
          })
        })
      })
      // 3) tri par proximité
      .orderByRaw(
        'levenshtein(lower(title), lower(?)) ASC, similarity(lower(title), lower(?)) DESC',
        [q, q]
      )
      .limit(20)

    return response.ok(rows)
  }



  public async getMangaDetailsWithId({ params, response }: HttpContext) {
    const workId = params.id

    if (!workId) {
      return response.badRequest({ message: 'Aucun ID de manga fourni.' })
    }

    try {
      const work = await Work.findOrFail(workId)
      return response.ok(work)
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du manga :', error)
      return response.notFound({ message: 'Manga non trouvé.' })
    }
  }

  public async searchImages({ params, response }: HttpContext) {
    const workId = params.id

    if (!workId) {
      return response.badRequest({ message: 'Aucun ID de manga fourni.' })
    }

    try {
      const work = await Work.findOrFail(workId)
      if (!work.sourceUrl) {
        return response.badRequest({ message: 'Le manga n\'a pas d\'URL source.' })
      }

      const images = await scrapeImagesFromUrl(work.sourceUrl)

      return response.ok({ images }) // ✅ retourne les images dans un objet
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des images :', error)
      return response.notFound({ message: 'Manga non trouvé ou erreur de scraping.' })
    }
  }

  public async putFavoriteManga({ auth, params, response }: HttpContext) {
    const workId = params.id
    const user = auth.use('api').user

    if (!user) {
      return response.unauthorized({ message: false })
    }

    if (!workId) {
      return response.badRequest({ message: false })
    }

    try {
      // Vérifie si la ligne existe déjà
      const existing = await db
        .from('user_work_favorites')
        .where('user_id', user.id)
        .andWhere('work_id', workId)
        .first()

      console.log(existing)
      if (existing) {
        console.log("dedans ")
        // ❌ Supprime la ligne si déjà présente
        await db
          .from('user_work_favorites')
          .where('user_id', user.id)
          .andWhere('work_id', workId)
          .delete()

        return response.ok({ message: true})
      } else {
        // ✅ Ajoute la ligne sinon
        await db.table('user_work_favorites').insert({
          user_id: user.id,
          work_id: workId,
        })

        return response.ok({ message: true})
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des favoris :', error)
      return response.status(500).json({ message: false })
    }
  }

  public async ifMangaIsFavorite({ auth, params, response }: HttpContext) {
    const workId = params.id
    const user = auth.use('api').user
console.log("test ",workId)
    if (!user) {
      return response.unauthorized({ message: false })
    }

    if (!workId) {
      return response.badRequest({ message: false })
    }

    try {
      // Vérifie si la ligne existe déjà
      const existing = await db
        .from('user_work_favorites')
        .where('user_id', user.id)
        .andWhere('work_id', workId)
        .first()

      console.log(existing)

      if (existing) {


        // ✅ Manga is favorite
        return response.ok({ message: true})
      } else {
        console.log("nop ")
        // ❌ Manga is not favorite
        return response.ok({ message: false})
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des favoris :', error)
      return response.status(500).json({ message: false })
    }
  }

  public async getFavoriteMangas({ auth, response }: HttpContext) {
    const user = auth.use('api').user

    if (!user) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    try {
      // Récupère les mangas favoris de l'utilisateur avec les détails complets
      const favoriteWorks = await db
        .from('works')
        .join('user_work_favorites', 'works.id', 'user_work_favorites.work_id')
        .where('user_work_favorites.user_id', user.id)
        .select('works.*')

      return response.ok(favoriteWorks)
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des mangas favoris :', error)
      return response.status(500).json({ message: 'Internal Server Error' })
    }
  }


}
