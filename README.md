# 🚗 AutoTrack — Vehicle Service Management System

AutoTrack is a modern, full-stack vehicle service and workshop management system designed to streamline customer management, vehicle tracking, service order processing, invoicing/billing, and customer feedback.

---

## ✨ Features

- 📊 **Dashboard & Analytics**: Real-time stats on pending jobs, completed service orders, total revenue, and active customers.
- 👥 **Customer Management**: Register, view, update, and manage customer records seamlessly.
- 🚘 **Vehicle Tracking**: Link vehicles to specific owners, maintain service histories, and store specifications.
- 🛠️ **Service Order Management**: Create, assign, status-track (Pending, In Progress, Completed), and handle service jobs.
- 💳 **Billing & Invoicing**: Generate detailed bills, view payment statuses, calculate taxes/totals, and export invoices.
- 💬 **Feedback & Ratings**: Collect customer ratings and feedback to monitor service quality.
- 🔒 **Authentication & Database**: Powered by Supabase for authentication and real-time database persistence.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Icons & Animations** | [Lucide React](https://lucide.dev/) + [Framer Motion](https://www.framer.com/motion/) |
| **State & Data Fetching** | [TanStack React Query v5](https://tanstack.com/query/latest) |
| **Routing** | [React Router DOM v6](https://reactrouter.com/) |
| **Backend & DB** | [Supabase](https://supabase.com/) |
| **Export Utilities** | [html2canvas](https://html2canvas.hertzen.com/) & [jsPDF](https://github.com/parallax/jsPDF) |

---

## 📁 Project Structure

```text
autotrack12/
├── src/
│   ├── components/         # Reusable UI components & Layout wrapper
│   │   ├── ui/             # shadcn/ui component library
│   │   └── Layout.tsx      # Main application layout with Sidebar navigation
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Backend integrations (Supabase client & types)
│   ├── lib/                # Helper utilities and formatting functions
│   ├── pages/              # Main route pages
│   │   ├── Auth.tsx        # User login & registration
│   │   ├── Dashboard.tsx   # Metric overview & quick actions
│   │   ├── Customers.tsx   # Customer management table & forms
│   │   ├── Vehicles.tsx    # Vehicle inventory & service links
│   │   ├── Services.tsx    # Active service job tracking
│   │   ├── Billing.tsx     # Invoicing & payment management
│   │   ├── Feedback.tsx    # Customer reviews & ratings
│   │   └── NotFound.tsx   # 404 page
│   ├── App.tsx             # Application routing & provider wrapping
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.ts          # Vite build configuration
└── package.json            # Scripts & project dependencies
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- `npm` or `yarn` / `pnpm`

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Yash-0209-git/autotrack12.git
   cd autotrack12
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:8080` in your browser to see the application.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server with HMR.
- `npm run build`: Bundles the application for production.
- `npm run preview`: Preview the production build locally.
- `npm run lint`: Runs ESLint check across all project files.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

