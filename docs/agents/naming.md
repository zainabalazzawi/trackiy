# Product naming

Conventions for `app/product/` and its HTTP helpers. Apply these when adding or renaming modules.

## Entity modules

Use a **plural** noun for the module file and exported namespace:

- `tickets.ts` → `tickets`
- `comments.ts` → `comments`
- `projectMembers.ts` → `projectMembers`
- `boardLanes.ts` → `boardLanes`

One-off helpers that are not their own aggregate may live on (or next to) the plural module — e.g. `requireBoardLane` in `boardLanes.ts`.

## Shared result type

The ok/fail shape is `ProductResult<T, C>`, with `ok` / `fail` helpers, in `result.ts`. Prefer domain-specific aliases (`TicketResult`, `BoardLaneResult`) at call sites.

## HTTP mapping

Map `ProductResult` failures to responses in `app/api/httpHelpers/resultHttp.ts` via `errorResponse`. Do not use “write” in these names.

## Prisma includes

Name includes after the entity they load, matching the module: `projectMemberInclude`, not a bare singular `memberInclude`.
