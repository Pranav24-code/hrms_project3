# HRMS & Payroll Dashboard - Frontend

A modern, responsive Human Resource Management System (HRMS) and Payroll Dashboard built with React, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: [React](https://reactjs.org/) (Vite)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)

## 📂 Project Structure

```text
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components (buttons, inputs, etc.)
│   │   ├── layout/      # Sidebar, Navbar, Page shell
│   │   └── ui/          # Low-level shadcn components
│   ├── contexts/        # React Contexts (Auth, Theme)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Domain-specific pages
│   │   ├── attendance/  # Attendance tracking and logs
│   │   ├── dashboard/   # Main overview and analytics
│   │   ├── employees/   # Employee management (List, Add, Profile)
│   │   ├── payroll/     # Salary processing and history
│   │   └── reports/     # Data exports and summaries
│   ├── services/        # API and Data services
│   ├── styles/          # Global styles (index.css)
│   ├── types/           # TypeScript interface definitions
│   └── utils/           # Utility functions (date formatting, etc.)
├── package.json         # Project dependencies and scripts
└── vite.config.ts       # Vite configuration
```

## ✨ Frontend Changes & Enhancements

- **Domain-Driven Architecture**: Organized the codebase into feature-based modules (Attendance, Payroll, Employees) for better scalability.
- **Interactive Dashboards**: Implemented dynamic charts using Recharts to visualize workforce demographics, attendance trends, and payroll costs.
- **Advanced Employee Management**: Added detailed employee profiles, document management placeholders, and a streamlined onboarding flow.
- **Attendance Tracking**: Built a comprehensive attendance module with status indicators (Present, Late, Absent) and monthly logs.
- **Payroll Processing**: Designed a payroll management system for processing monthly salaries and viewing historical payments.
- **Premium UI/UX**: Applied a modern glassmorphism aesthetic with subtle animations, a dark/light mode toggle, and a fully responsive layout.
- **Type Safety**: Ensured 100% TypeScript coverage across the frontend for robust error handling and developer experience.

## 🛠️ Development

### Prerequisites
- Node.js (v18 or higher)
* npm or pnpm

### Getting Started

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📄 License
This project is part of the HRMS Payroll Suite.
