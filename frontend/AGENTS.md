<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Quy chuẩn Frontend bắt buộc
- **Package Manager**: Bắt buộc dùng `pnpm` (`pnpm add`, `pnpm install`, `pnpm dev`, `pnpm typecheck`, `pnpm lint`).
- **Linter & Formatter**: Sử dụng **Biome** (`biome.json`, chạy kiểm tra bằng `pnpm lint`, sửa lỗi định dạng bằng `pnpm format`).
- **Kiểm tra TypeScript**: Luôn chạy `pnpm typecheck` (`tsc --noEmit`) sau mỗi thay đổi code.
- **Stack công nghệ**:
  - Data Fetching: Native Fetch client (`src/lib/api-client.ts`) + TanStack Query v5 (`@tanstack/react-query`).
  - State: Zustand (`src/stores/`).
  - Form: React Hook Form + Zod validation (`src/schemas/`).
  - UI: Tailwind CSS v4 + Shadcn/ui (`src/components/ui/`) + `cn()` (`src/lib/utils.ts`).
<!-- END:nextjs-agent-rules -->

