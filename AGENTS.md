# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains application code. Routing lives in `src/App.jsx`, feature pages under `src/pages/`, and reusable pieces inside `src/components/`.
- `index.html` bootstraps the Vite build. Configuration is in `vite.config.js`.
- Assets should reside alongside the module that consumes them; prefer colocated imports (e.g., `src/pages/Home.jsx`).

## Build, Test, and Development Commands
- `npm install` (or `yarn install`) – installs dependencies; required before first run.
- `npm run dev` – starts the Vite dev server on port 5173 with hot reload.
- `npm run build` – produces an optimized production bundle in `dist/`.
- `npm run preview` – serves the built assets to validate the production build locally.

## Coding Style & Naming Conventions
- Follow ESLint defaults configured by Vite React; favor functional components and hooks.
- Use 2-space indentation, `camelCase` for variables/functions, `PascalCase` for components, and kebab-case for file names when multiple words are needed (`user-menu.jsx`).
- Prefer Chakra UI primitives for layout and theming; use `useColorModeValue` for color-aware styling.

## Testing Guidelines
- At present no automated tests exist. Add Vitest + React Testing Library when introducing logic-heavy features.
- Place component tests beside the component in `*.test.jsx` files. Use descriptive names (e.g., `Home.test.jsx`) and cover both light/dark mode paths when relevant.
- Run `npm run test` after adding a test script to package.json; do not merge failing suites.

## Commit & Pull Request Guidelines
- Craft concise commits using the imperative mood (`feat: add collapsible sidebar`). Group related changes together.
- PRs should describe the feature, list manual verification steps (`npm run dev` + screenshot), and mention related issues (e.g., `Closes #12`).
- Include screenshots or GIFs for UI updates (login page, dashboard) and note any Chakra theme changes or new scripts.

## Security & Configuration Tips
- Do not commit `.env` files; configure secrets via environment variables when extending the app.
- Review new dependencies for license/security concerns—particularly Chakra plugins or animation libraries.
