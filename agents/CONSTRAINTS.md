# Ràng buộc

- Không chạy lệnh xóa hoặc ghi đè diện rộng (`reset --hard`, xóa đệ quy, thay đổi hàng loạt) nếu yêu cầu không nêu rõ.
- Không thay đổi schema, dữ liệu seed, quyền truy cập hoặc cấu hình triển khai ngoài phạm vi yêu cầu.
- Không sửa tệp sinh tự động, dependency lockfile hoặc cấu hình công cụ trừ khi thay đổi yêu cầu trực tiếp.
- Không giả định kết quả Codegraph là đầy đủ khi công cụ báo `mixed`, `reduced`, `truncated`, `omitted` hoặc `stale`; hãy xác minh bằng mã nguồn và kiểm thử liên quan.
- Khi phát hiện yêu cầu mơ hồ có thể ảnh hưởng dữ liệu, bảo mật hoặc API công khai, dừng ở mức an toàn và nêu rõ lựa chọn cần quyết định.
