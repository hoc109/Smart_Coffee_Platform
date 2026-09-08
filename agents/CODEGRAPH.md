# Quy trình CodeGraph bắt buộc

Áp dụng cho mọi nhiệm vụ có sửa mã nguồn. Chạy lệnh từ thư mục gốc repository.

## Trước khi sửa mã

1. Kiểm tra chỉ mục: `codegraph status`.
2. Lấy ngữ cảnh nhỏ nhất phù hợp:
   - Chưa rõ phần cần sửa: `codegraph explore "<câu hỏi về luồng hoặc chức năng>"`.
   - Biết tên ký hiệu: `codegraph query <tên-ký-hiệu>` rồi `codegraph node <tên-ký-hiệu>`.
   - Cần biết quan hệ gọi hàm: `codegraph callers <ký-hiệu>` hoặc `codegraph callees <ký-hiệu>`.
   - Cần xem cấu trúc tệp: `codegraph files` hoặc `codegraph node <đường-dẫn-tệp>`.
3. Đọc trực tiếp các tệp liên quan trước khi chỉnh sửa. CodeGraph định hướng việc đọc mã, không thay thế nó.

## Tự động cập nhật

CodeGraph được kết nối với Codex qua MCP. Khi Codex đang chạy, watcher của CodeGraph theo dõi các thay đổi tệp và tự đồng bộ graph sau một khoảng debounce ngắn. Không cần chạy `codegraph sync` sau mỗi lần lưu tệp.

Chạy `codegraph sync` khi cần cập nhật ngay lập tức trong terminal hoặc khi `codegraph status` báo chỉ mục chưa đồng bộ.

## Sau khi sửa mã

1. Dùng `codegraph impact <ký-hiệu>` cho thay đổi có thể tác động liên tệp; dùng `codegraph affected <đường-dẫn-tệp>` để tìm test liên quan.
2. Chạy các kiểm tra phù hợp với phần ảnh hưởng (đối với frontend: chỉ `pnpm lint` và `pnpm typecheck`).
3. Không coi graph là bằng chứng runtime đầy đủ; xác minh bằng mã nguồn và kiểm tra liên quan.

Không cần dùng CodeGraph cho thay đổi chỉ tài liệu hoặc không liên quan đến mã nguồn.
