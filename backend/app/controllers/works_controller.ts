// import type { HttpContext } from '@adonisjs/core/http'

import type { HttpContext } from '@adonisjs/core/http'
import { scrapeAllWorks } from '#services/scrapeAllWorks'
import Work from '#models/work'
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
      console.log(works)
      return response.ok(works)
    } catch (err) {
      console.error('❌ Scrape error (all works)', err)
      return response.status(500).json({ message: 'Scraping failed' })
    }
  }

  public async searchManga({ request, response }: HttpContext) {
    console.log('🔍 Recherche de manga...')
    const query = request.input('query', '').trim()
    console.log('🔍 Recherche de manga pour la requête :', query)
    if (!query) {
      return response.badRequest({ message: 'Aucune requête fournie.' })
    }

    const works = await Work.query()
      .whereILike('title', `%${query}%`)
      // .orWhereILike('description', `%${query}%`)
      // .orWhereRaw(`genres::text ILIKE ?`, [`%${query}%`]) // pour rechercher dans les genres JSON-stringifiés
      .limit(20) // limite pour éviter de surcharger
    console.log(works)
    return response.ok(works)
  }

  public async getMangaDetailsWithId({ params, response }: HttpContext) {
    const workId = params.id
    console.log("🔍 Récupération des détails du manga avec l'ID :", workId)

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
}
