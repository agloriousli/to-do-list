# 🎯 To-Do List App

A modern, feature-rich to-do list application built with Next.js, featuring beautiful pastel themes, Discord-style messaging, and comprehensive task management capabilities.

## ✨ Features

### 🎨 **Beautiful Themes**
- **6 Custom Pastel Themes**: Black & White, Lavender Mist, Mint Sorbet, Peach Bloom, Sky Fade, and Citrus Haze
- **Light & Dark Mode** support for each theme
- **Dynamic Color System** with theme-aware task colors
- **8 Modern Fonts** including Inter, Roboto, Poppins, and more
- **Real-time Theme Switching** with instant visual updates

### 📋 **Advanced Task Management**
- **Task Types**: Learn, Discover, Do, Repeat
- **Priority Levels**: Casual, Important, Urgent
- **Categories**: Customizable task categories
- **Due Dates**: Optional datetime scheduling
- **Notes & Links**: Rich task descriptions and external references
- **Progress Tracking**: Visual progress bars with completion percentages

### 🌳 **Hierarchical Subtasks**
- **Nested Task Structure**: Unlimited subtask depth
- **Full Subtask Features**: Subtasks have all the same capabilities as main tasks
- **Collapsible Views**: Show/hide subtasks with toggle controls
- **Completion Inheritance**: Marking parent tasks incomplete resets all subtasks

### 💬 **Discord-Style Messaging**
- **Task Channels**: Each task has its own messaging channel
- **File Attachments**: Upload and share files within task discussions
- **Reactions**: React to messages with emojis
- **Lasso Selection**: Multi-select messages with drag selection
- **Real-time Updates**: Instant message synchronization

### 🔍 **Smart Filtering & Search**
- **Quick Filters**: All, Incomplete, Complete tasks
- **Category Filtering**: Filter by task categories
- **Search Functionality**: Search across task names and notes
- **Urgency Filters**: Find urgent or overdue tasks
- **Real-time Results**: Instant filtering and search results

### 📊 **Analytics & Overview**
- **Task Statistics**: Total, completed, and completion rate
- **Urgent Task Alerts**: Overdue and upcoming task notifications
- **Category Breakdown**: Task counts by category
- **Progress Visualization**: Beautiful progress bars and charts

### 🎯 **User Experience**
- **Responsive Design**: Works perfectly on desktop and mobile
- **Smooth Animations**: Elegant transitions and hover effects
- **Glow Effects**: Beautiful shadows and gradients throughout
- **Persistent Storage**: Tasks and settings saved locally
- **Keyboard Shortcuts**: Efficient task management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd to-do-list
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with shadcn/ui
- **State Management**: React Context API
- **Storage**: Local Storage with JSON serialization
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📁 Project Structure

```
to-do-list/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles and theme variables
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── task-card.tsx     # Individual task display
│   ├── task-sidebar.tsx  # Sidebar with filters and stats
│   ├── create-task-form.tsx # Task creation form
│   ├── theme-selector.tsx # Theme customization
│   └── task-channel.tsx  # Messaging system
├── classes/              # Business logic classes
│   ├── task.ts          # Task model and methods
│   └── task-manager.ts  # Task management and storage
├── types/               # TypeScript type definitions
│   ├── task-types.ts    # Task-related types
│   └── theme-types.ts   # Theme configuration types
├── lib/                 # Utility functions and context
│   ├── theme-context.tsx # Theme provider and context
│   └── utils.ts         # Helper functions
└── hooks/               # Custom React hooks
```

## 🎨 Customization

### Adding New Themes
1. Open `types/theme-types.ts`
2. Add your theme to the `ThemeName` type
3. Define light and dark mode colors in the `THEMES` array
4. Include task subcolors for dynamic task coloring

### Customizing Fonts
1. Add your font to `FONT_OPTIONS` in `types/theme-types.ts`
2. Import the font in `app/layout.tsx`
3. Add CSS variables for the font in `app/globals.css`

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Features Implementation
- **Theme System**: Context-based theme management with localStorage persistence
- **Task Management**: Class-based architecture with TypeScript interfaces
- **Messaging**: Real-time message handling with file upload support
- **Storage**: JSON serialization with error handling and SSR safety

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Beautiful themes and modern design patterns

---

**Happy task managing! 🎯✨**
