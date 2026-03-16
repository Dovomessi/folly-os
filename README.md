# Folly OS

Dashboard de productivité professionnel style Linear - Projets, Tâches, Rendez-vous, Notes, Passwords.

![Folly OS](https://folly-os.vercel.app)

## 🚀 Démo en ligne

**https://folly-os.vercel.app**

## ✨ Fonctionnalités

- **🔐 Authentification** - Login/signup avec email (localStorage pour l'instant)
- **📁 Projets** - CRUD complet avec couleurs personnalisables
- **📋 Tâches/Kanban** - Tableau type Trello avec colonnes À faire/En cours/Terminé
- **📅 Rendez-vous** - Calendrier par projet avec gestion des créneaux
- **📝 Notes** - Éditeur de notes simple par projet
- **🔒 Passwords** - Vault de mots de passe avec génération et copie
- **🎨 Design Linear** - Interface sombre, accents violets, animations fluides

## 🛠 Stack technique

- **Framework**: Next.js 14 (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand + localStorage
- **Icons**: Lucide React
- **Déploiement**: Vercel

## 🏗 Architecture

### Entité centrale : Le Projet

```
Projet
├── Tâches (Kanban)
├── Rendez-vous (Calendrier)
├── Notes (Éditeur)
└── Passwords (Vault)
```

### Design System (Style Linear)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--background` | `#0F1115` | Fond principal |
| `--card` | `#161922` | Cartes, panels |
| `--popover` | `#1F232E` | Menus, dropdowns |
| `--primary` | `#5E6AD2` | Accents, boutons |
| `--border` | `#2A2D37` | Bordures |
| `--text` | `#F7F8F8` | Texte principal |
| `--text-secondary` | `#8A8F98` | Texte secondaire |

## 🚀 Démarrage

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation

```bash
# Cloner le repo
git clone https://github.com/Dovomessi/folly-os.git
cd folly-os

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
```

## 🔌 Intégration Supabase (Optionnel)

Pour activer la persistance backend :

1. **Installer Supabase**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Créer les tables**
   - Allez dans l'éditeur SQL de Supabase
   - Copiez le contenu de `supabase/schema.sql`
   - Exécutez le script

3. **Configurer le client**
   - Décommentez le code dans `src/lib/supabase.ts`
   - Ajoutez vos variables d'environnement :
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
     ```

4. **Mettre à jour le store**
   - Remplacez les appels localStorage par des appels Supabase dans `src/lib/store.ts`

## 📡 API pour Agents Externes

L'API est documentée dans `/api/index.json` :

```bash
curl https://folly-os.vercel.app/api/index.json
```

### Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/projects` | GET/POST | Projets |
| `/api/tasks` | GET/POST | Tâches |
| `/api/appointments` | GET/POST | Rendez-vous |
| `/api/notes` | GET/POST | Notes |
| `/api/passwords` | GET/POST | Passwords |

**Note**: Actuellement en mode client-side storage. Pour l'API backend, déployez avec Supabase.

## 📁 Structure du projet

```
folly-os/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Dashboard principal
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Styles globaux
│   ├── components/
│   │   ├── sidebar.tsx       # Sidebar avec projets
│   │   ├── auth-form.tsx     # Formulaire auth
│   │   ├── kanban-board.tsx  # Board Trello-like
│   │   ├── calendar-view.tsx # Vue calendrier
│   │   ├── notes-view.tsx    # Vue notes
│   │   ├── passwords-view.tsx # Vue passwords
│   │   └── ui/               # Composants shadcn/ui
│   ├── lib/
│   │   ├── store.ts          # Zustand store
│   │   ├── supabase.ts       # Config Supabase
│   │   └── utils.ts          # Utilitaires
│   └── types/
├── supabase/
│   └── schema.sql            # Schéma DB
├── public/
│   └── api/
│       └── index.json        # Doc API
├── tailwind.config.ts
├── next.config.js
└── package.json
```

## 🎯 Roadmap

- [x] Auth basique
- [x] CRUD Projets
- [x] Kanban Tâches
- [x] Calendrier RDV
- [x] Éditeur Notes
- [x] Vault Passwords
- [ ] Intégration Supabase complète
- [ ] Drag & drop Kanban
- [ ] Recherche globale
- [ ] Raccourcis clavier
- [ ] Mode hors-ligne
- [ ] API REST complète

## 📝 License

MIT - Folly Germain AMOUZOUVI DOVO

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une PR.
