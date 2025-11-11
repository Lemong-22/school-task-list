# School Task List (Project Sekolah)

Sistem manajemen tugas tergamifikasi yang dibangun dengan React, Vite, TypeScript, dan Supabase. Dibuat oleh Yosia Edmund Herlianto (lemong-22).

## ✨ Features

- 🎯 **Task Management** - Create, assign, and track student tasks
- 🎮 **Gamification** - Earn coins, unlock titles, and compete on leaderboards
- 🏆 **Hall of Fame** - Showcase top performers with customizable namecards
- 🛍️ **Shop System** - Purchase items and customize your profile
- 💬 **Comments & Attachments** - Collaborate on tasks with rich media support
- 📊 **Analytics Dashboard** - Track progress and performance metrics

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Lemong-22/school-task-list.git
   cd school-task-list
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   Get these credentials from your Supabase dashboard at `Settings > API`.

4. **Run database migrations:**
   Apply the migrations in `supabase/migrations/` to your Supabase project.

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
school-task-list/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components (routes)
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React context providers
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── services/       # API services
│   ├── constants/      # App constants
│   └── config/         # Configuration files
├── supabase/
│   ├── migrations/     # Database migrations
│   └── scripts/        # SQL utility scripts
├── docs/               # Project documentation
│   ├── phases/         # Development phase docs
│   ├── features/       # Feature implementation docs
│   ├── bugfixes/       # Bug fix documentation
│   ├── status/         # Current status docs
│   └── guides/         # Implementation guides
└── agent-os/           # AI agent configuration
```

## 📚 Documentation

For detailed documentation, see the [`docs/`](./docs/) directory:
- [Implementation Status](./docs/status/IMPLEMENTATION_STATUS.md)
- [Feature Guides](./docs/features/)
- [Phase Documentation](./docs/phases/)

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Routing:** React Router v6
- **UI Libraries:** Framer Motion, Lucide Icons, Recharts
- **Additional:** Howler.js (audio), Canvas Confetti (animations), React Joyride (onboarding)

## 👥 User Roles

- **Teacher:** Create and manage tasks, view analytics, award coins
- **Student:** Complete tasks, earn rewards, compete on leaderboards

## 🤝 Contributing

This is a school project. For questions or suggestions, please contact the developer.

## 📄 License

Private project - All rights reserved.

## 👨‍💻 Developer

**Yosia Edmund Herlianto (Lemong-22)**