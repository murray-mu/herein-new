# herein — 此间 HEREIN

React + TypeScript + Vite frontend with Express backend. AI-powered city observation system.

## Project structure

- `web/` — React 19 SPA with Tailwind CSS 4
- `backend/` — Express server with OpenAI integration

## Commands

```bash
# Frontend
cd web && npm run dev     # Vite dev server
cd web && npm run build   # TypeScript + Vite production build

# Backend
cd backend && npm run dev  # Express server on :3001
```

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
