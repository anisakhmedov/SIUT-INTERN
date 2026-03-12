# Copilot Instructions for SIUT AI Codebase

## Project Overview
- **Frontend:** React (JSX) with Vite for fast development and HMR.
- **Styling:** Tailwind CSS (see `tailwind.config.js`, `postcss.config.js`).
- **Backend:** Node.js/Express (see `backend/`), with models in `backend/models/`.
- **Entry Points:**
  - Frontend: `src/main.jsx` (mounts `App.jsx`)
  - Backend: Likely starts from a file in `backend/` (not shown here)

## Key Directories & Files
- `src/components/`: Main React pages/components (`Dashboard.jsx`, `LoginPage.jsx`, etc.)
- `src/App.jsx`: Top-level React component, routes/pages are likely managed here.
- `backend/models/Internship.js`: Mongoose/ORM model for internships.
- `public/`: Static assets for frontend.
- `index.html`: Main HTML template for Vite/React app.

## Developer Workflows
- **Start Frontend:**
  - Use Vite: `npm run dev` (see `package.json` scripts)
- **Build Frontend:**
  - `npm run build` (outputs to `dist/`)
- **Linting:**
  - ESLint config in `eslint.config.js`
- **Styling:**
  - Tailwind CSS classes in JSX, config in `tailwind.config.js`

## Patterns & Conventions
- **Component Structure:**
  - Pages/components in `src/components/`, imported into `App.jsx`.
  - Use functional components and hooks (see `Dashboard.jsx`, etc.).
- **State Management:**
  - No Redux/MobX detected; likely using React context/hooks.
- **Backend Integration:**
  - API endpoints likely served from `backend/` (not shown in detail).
  - Models in `backend/models/` suggest MongoDB/Mongoose usage.
- **Styling:**
  - Use Tailwind utility classes in JSX.

## Integration Points
- **Frontend/Backend Communication:**
  - Likely via REST API calls (fetch/axios) from React components to backend endpoints.
- **External Dependencies:**
  - Vite, React, Tailwind CSS, ESLint (see `package.json` for full list).

## Examples
- To add a new page, create a component in `src/components/`, import and route it in `App.jsx`.
- To add a new data model, create a file in `backend/models/` and update backend routes/controllers.

## References
- See `README.md` for Vite/React setup details.
- See `tailwind.config.js` and `postcss.config.js` for styling setup.
- See `eslint.config.js` for linting rules.

---
**Update this file as project structure or conventions evolve.**
