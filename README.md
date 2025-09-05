# Maanjaco Kévin METRI

Application de suivi et recherche de mangas (web/mobile) avec un backend Node.js (AdonisJS + PostgreSQL) et un frontend Expo/React Native. Le projet intègre un moteur de scraping pour alimenter la base de données (œuvres, chapitres, couvertures) et une recherche tolérante aux fautes.

**Sommaire**
- Présentation
- Architecture
- Prérequis
- Démarrage rapide
- Backend (API)
- Frontend (App Expo)
- Base de données
- Scraping
- Endpoints principaux
- Déploiement et variables d’environnement
- Roadmap succincte

**Présentation**
- Objectif: rechercher des mangas, consulter les détails, suivre sa progression, gérer ses favoris et permettre quelques actions d’admin (ex. suggestion/mise à jour de couvertures).
- Points clés: Auth par token (AdonisJS), scraping Puppeteer/Cheerio, PostgreSQL + extensions pour la recherche fuzzy, Expo Router côté client.

**Architecture**
- Monorepo avec deux packages principaux:
  - `backend/`: API REST AdonisJS 6 (TypeScript) + Lucid ORM + PostgreSQL
  - `frontend/`: client Expo/React Native (web/mobile) avec Expo Router et Tailwind (NativeWind)
- Orchestration locale de la base via `docker-compose.yml` (Postgres + pgAdmin)

Arborescence (résumé):
- `backend/app/controllers/`: contrôleurs HTTP (`auth_controller.ts`, `works_controller.ts`)
- `backend/app/models/`: modèles Lucid (`user`, `work`, `user_work_favorite`, `website`, etc.)
- `backend/app/services/`: scraping et utilitaires (`scrapeAllWorks.ts`, `scrapeChapterCount.ts`)
- `backend/start/`: config runtime (routes, kernel, env)
- `backend/database/migrations`: schéma SQL
- `backend/database/seeders`: peuplement et scrapers batch
- `frontend/app/`: pages Expo Router (onglets, détails, auth)
- `frontend/services/`: appels API (Auth, Works)

**Prérequis**
- Node.js 18+ (recommandé 20+), npm (ou pnpm/yarn)
- Docker + Docker Compose
- PostgreSQL extensions: `pg_trgm` et `fuzzystrmatch` (créés automatiquement si vous les activez manuellement via pgAdmin/psql)
- Chromium/Chrome installé pour le scraping Puppeteer
  - Par défaut, le scraping utilise un `executablePath` macOS Homebrew: `/opt/homebrew/bin/chromium` (modifiez-le selon votre OS)

**Démarrage rapide**
1) Base de données
- Lancer Postgres + pgAdmin: `docker compose up -d`
- pgAdmin disponible sur `http://localhost:8080` (email: `admin@admin.com`, mdp: `admin`)

2) Backend (API)
- Copier `backend/.env.example` vers `backend/.env` et ajuster les valeurs
- Installer les dépendances: `cd backend && npm i`
- Générer la clé d’app: `node ace generate:key` (remplir `APP_KEY`)
- Lancer les migrations: `node ace migration:run`
- (Optionnel) Créer les extensions Postgres si nécessaire:
  - `CREATE EXTENSION IF NOT EXISTS pg_trgm;`
  - `CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;`
- Démarrer en dev (HMR): `npm run dev`
- Par défaut, l’API écoute sur `http://localhost:3333` (selon `PORT` dans `.env`)

3) Frontend (Expo)
- Copier `frontend/.env.example` vers `frontend/.env` et définir `EXPO_PUBLIC_API_URL` (ex: `http://localhost:3333`)
- Installer: `cd frontend && npm i`
- Démarrer: `npm run web` (ou `npm start` puis choisir la plateforme)

**Backend (API)**
- Framework: AdonisJS 6 (TypeScript), ORM Lucid, Auth tokens (DbAccessTokensProvider)
- Modèles principaux: `User`, `Work`, `UserWorkFavorite`, `UserProgress`, `Admin`, `Website`
- Recherche: SQL avec `similarity` (pg_trgm) + `levenshtein_less_equal` (fuzzystrmatch) pour une recherche tolérante aux fautes
- Scraping:
  - Temps réel via services Puppeteer (`scrapeAllWorks`, `scrapeImagesFromUrl`)
  - Batch via seeders (axios + cheerio) pour Mangakakalot
- Scripts npm:
  - `npm run dev`: serveur avec HMR
  - `npm run build`: build pour prod
  - `npm run start`: lance le serveur compilé
  - `npm run test`: lance les tests Japa (si présents)

Configuration .env (extrait, voir `backend/.env.example`):
- `PORT=3333`
- `APP_KEY=...` (générée via Ace)
- `HOST=0.0.0.0`
- `DB_HOST=localhost`, `DB_PORT=5432`, `DB_USER=admin`, `DB_PASSWORD=admin`, `DB_DATABASE=app`

**Frontend (App Expo)**
- Stack: Expo Router, React Native 0.79, React 19, NativeWind (Tailwind)
- Pages: login, register, home, search, favorites, work-details, admin (onglets)
- Auth: stockage du token dans `AsyncStorage`, `AuthProvider` protège les routes et expose `isAuthenticated`/`isAdmin`
- Config `.env` (Expo): `EXPO_PUBLIC_API_URL` pointe vers l’API (ex: `http://localhost:3333`)

Commandes:
- `npm run web` / `npm run ios` / `npm run android` selon la plateforme

**Base de données**
- PostgreSQL (voir `docker-compose.yml`)
- Tables clés via migrations:
  - `users`, `auth_access_tokens`
  - `works` (titre, type, urls, chapitres, description, genres)
  - `user_progresses` (progression de lecture)
  - `user_work_favorites` (favoris, contrainte d’unicité user+work)
  - `admins` (liste des utilisateurs admins)
- Extensions requises pour la recherche: `pg_trgm`, `fuzzystrmatch`

Seeders utiles (`backend/database/seeders`):
- `scrap_manga_seeder.ts`: récupère la liste Mangakakalot (axios + cheerio), description + genres
- `duckduckgo_cover_seeder.ts`: met à jour les couvertures via DuckDuckGo Images (Puppeteer)
- `user_seeder.ts`: utilisateurs de démo
- `website_seeder.ts`: configuration source (ex. Mangakakalot)
- Exécution: `node ace db:seed` (recommandé après les migrations)

**Scraping**
- `app/services/scrapeAllWorks.ts`:
  - Parcourt les pages liste d’un site (configurable: sélecteurs cartes/liens/images, pagination/load-more)
  - Évite la détection via `puppeteer-extra-plugin-stealth`
  - Compte les chapitres par série (sélecteurs de page chapitres) ou par heuristique « dernier chapitre »
- `app/services/scrapeChapterCount.ts`:
  - Récupère le nombre de chapitres d’une série donnée (bouton « load more » pris en charge)
- `scrapeImagesFromUrl()`:
  - Suggère des couvertures via DuckDuckGo pour une œuvre donnée

Attention: le `executablePath` par défaut (`/opt/homebrew/bin/chromium`) convient à macOS/ARM (Homebrew). Adaptez-le à votre installation ou exposez `PUPPETEER_EXECUTABLE_PATH` dans l’environnement.

**Endpoints principaux**
- Auth
  - `POST /auth/register` → créer un user
  - `POST /auth/login` → retourner `{ user, token }`
  - `POST /auth/checkIsLogin` (auth) → `{ message: boolean }`
  - `GET /auth/isAdmin` (auth) → `{ message: boolean }`
- Works (auth)
  - `GET /works/search?query=...` → liste des œuvres (recherche fuzzy)
  - `GET /getWorkById/:id` → détails œuvre
  - `GET /works/searchImages/:id` → images de couverture suggérées (DuckDuckGo)
- Favoris (auth)
  - `POST /users/favoriteManga/:id` → toggle favori
  - `GET /users/ifMangaIsFavorite/:id` → `{ message: boolean }`
  - `GET /users/getFavoriteMangas` → liste des œuvres favorites

Codes d’auth: transmettre le token Bearer via `Authorization: Bearer <token>`.

**Déploiement et variables d’environnement**
- Backend (`backend/.env`): PORT, HOST, APP_KEY, DB_*
- Frontend (`frontend/.env`): `EXPO_PUBLIC_API_URL=https://api.mondomaine.com`
- Chrome/Chromium: définir `PUPPETEER_EXECUTABLE_PATH` si nécessaire pour les seeders/CI

**Roadmap succincte**
- Historique de lecture persistant côté backend (`user_progresses` endpoints)
- Tâches planifiées pour rafraîchir chapitres/couvertures
- Normalisation multi-sources (Phenix Scans, Scan-Manga, …) via table `websites`
- Amélioration UI/UX mobile (offline, performance listes)

—
Pour toute question ou pour étendre la doc (diagrammes détaillés, OpenAPI, scripts de seed ciblés), n’hésitez pas à demander.
