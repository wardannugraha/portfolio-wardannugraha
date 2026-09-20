<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Critical Workspace Rules
- **NEVER RESET THE DATABASE**: Do NOT run `prisma migrate reset`, `prisma db push --force-reset`, or any destructive database operations. Always preserve existing project, skill, media, achievement, and setting records. Store new configurations (such as CV presets/templates) inside the existing `SiteSetting` key-value model or safe non-destructive queries.

