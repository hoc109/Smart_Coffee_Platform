# Quy ước dự án

- Dự án gồm `frontend/` (Next.js App Router), `backend/` (Spring Boot) và `database/` (SQL Server scripts).
- Giữ thay đổi theo đúng lớp: giao diện/route ở `frontend/`, API và nghiệp vụ ở `backend/`, schema hoặc seed ở `database/`.
- **Package Manager**: Frontend bắt buộc sử dụng **`pnpm`** (không dùng `npm` hay `yarn`).
- **Tooling & Kiểm tra**:
  - Dev Server: `pnpm dev` (chạy với Turbopack `--turbopack`).
  - Linter & Formatter: `pnpm lint` và `pnpm format` (sử dụng **Biome** qua `biome.json`).
  - Kiểm tra kiểu dữ liệu: `pnpm typecheck` (`tsc --noEmit`).
- **Kiến trúc Frontend tiêu chuẩn**:
  - **Data Fetching**: Sử dụng Native `fetch` client ([`src/lib/api-client.ts`](file:///X:/Web%20QLCafe/frontend/src/lib/api-client.ts)) kết hợp **TanStack Query v5** ([`QueryProvider.tsx`](file:///X:/Web%20QLCafe/frontend/src/components/providers/QueryProvider.tsx)).
  - **State Management**: **Zustand** ([`src/stores/`](file:///X:/Web%20QLCafe/frontend/src/stores/)) cho client state (ví dụ: `useAuthStore`).
  - **Form & Validation**: **React Hook Form** kết hợp **Zod** schema ([`src/schemas/`](file:///X:/Web%20QLCafe/frontend/src/schemas/)).
  - **UI & Components**: **Tailwind CSS v4** kết hợp **Shadcn/ui** primitives ([`src/components/ui/`](file:///X:/Web%20QLCafe/frontend/src/components/ui/)) với helper `cn()` ([`src/lib/utils.ts`](file:///X:/Web%20QLCafe/frontend/src/lib/utils.ts)).
  - **Authentication**: Hỗ trợ đăng nhập username/password và Google OAuth2 ID Token ([`GoogleSignInButton.tsx`](file:///X:/Web%20QLCafe/frontend/src/components/auth/GoogleSignInButton.tsx), backend API `/api/auth/google`).
- Khi sửa `frontend/`, đọc và tuân thủ `frontend/AGENTS.md`; trước khi dùng API Next.js, đọc tài liệu tương ứng trong `frontend/node_modules/next/dist/docs/` nếu có.
- Ưu tiên thay đổi nhỏ, nhất quán với cấu trúc và phong cách đã có trong tệp lân cận.
- Với thay đổi giao diện, duy trì khả năng truy cập cơ bản: nhãn rõ ràng, điều khiển dùng được bằng bàn phím và trạng thái tải/lỗi phù hợp.

