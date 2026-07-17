# GenReview AI Platform Model v1.0.0

GenReview AI is a multi-tenant client reputation router built for local businesses. It allows managers to route ratings below a specific threshold to private feedback channels, while directing positive promoters to direct Google Review drafts.

---

## 📁 Structured Directory Schema

```text
Model_V1.0/
├── prisma/
│   └── schema.prisma         # Prisma relational database model configurations
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── feedback/     # Private detractor feedback API endpoints
│   │   │   └── review/       # Google promoter session API endpoints
│   │   │   
│   │   ├── dashboard/
│   │   │   ├── admin/        # Multi-tenant administrator portal
│   │   │   └── page.tsx      # Location manager console (tabs: Overview, Feedback, Analytics, Compliance)
│   │   │   
│   │   ├── onboarding/       # Multi-step merchant registration form
│   │   ├── r/[businessId]/   # Dynamic customer-facing routing viewport
│   │   ├── globals.css       # Tailwind entry styles & visual mesh gradients
│   │   └── layout.tsx        # HTML document layout wrappers
│   │   
│   ├── components/
│   │   ├── customer/         # Customer rating components (Splash, RatingSelector, TagSelector, AIDrafts)
│   │   ├── dashboard/        # Dashboard layout shells, metrics components, configurations settings
│   │   └── ThemeSwitcher.tsx # Shared Light/Dark glassmorphic theme toggle
│   │   
│   └── styles/
│       └── theme.css         # Theme variables (Obsidian glassmorphism & Minimalist light theme)
│       
├── backend/
│   └── main.py               # FastAPI sentiment & NLP aspect extraction service
│   
├── .env                      # Database credentials parameters
├── package.json              # Next.js & React dependencies
├── postcss.config.js         # CSS compiler settings
├── tailwind.config.js        # CSS styling rules
├── requirements.txt          # Python ML/NLP library dependencies
├── run.bat                   # CLI launch helper
├── run.ps1                   # PowerShell execution policy bypass script
└── supabase_schema.sql       # Postgres raw migrations blueprint
```

---

## 🚀 Quick Start Instructions

1. **Install Dependencies**:
   ```powershell
   npm install
   ```

2. **Generate Database Bindings**:
   ```powershell
   node "node_modules\prisma\build\index.js" generate
   ```

3. **Launch Server**:
   Run via the provided PowerShell bypass script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\run.ps1
   ```
   Open **`http://localhost:3000`** in your browser.
