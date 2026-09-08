# Tiến trình: Tính năng Sửa và Xóa Bàn (Sơ đồ bàn)

**Trạng thái hiện tại:** Đã hoàn thành triển khai. ✅

## 1. Cơ chế Logic (Soft Delete)
- **An toàn dữ liệu:** Không xóa hẳn bàn khỏi Database (để giữ lịch sử hóa đơn).
- **Cách hoạt động:** Khi xóa, hệ thống sẽ đổi trạng thái (`status`) của bàn thành `DELETED`. Bàn này sẽ tự động bị ẩn khỏi giao diện Sơ đồ bàn và Đặt món. Các hóa đơn cũ có gắn với ID bàn này vẫn được giữ nguyên vẹn.

## 2. Giao diện (UI)
- **Nút 3 chấm (Menu thả xuống):** Ở góc trên cùng bên phải của mỗi thẻ (Card) Sơ đồ bàn sẽ có một icon 3 chấm dọc (`MoreVertical`).
- Khi bấm vào nút 3 chấm này, một menu nhỏ sẽ xổ ra (từ trên xuống dưới) gồm 2 tùy chọn:
  1. **Sửa (Icon Cây bút - Màu xanh):** Mở Modal để đổi tên bàn.
  2. **Xóa (Icon Thùng rác - Màu đỏ):** Hiện xác nhận và tiến hành Soft Delete.

## 3. Các bước Code cần thực hiện

### Backend (Spring Boot)
1. **`CafeTableRepository.java`**: Thêm hàm `List<CafeTable> findByStatusNot(String status);`
2. **`CafeTableService.java`**:
   - Sửa hàm `getAllTables()` thành dùng `findByStatusNot("DELETED")`.
   - Thêm hàm `updateTable(Integer id, String newName)`
   - Thêm hàm `deleteTable(Integer id)` (đổi status = "DELETED")
3. **`CafeTableController.java`**: Thêm `@PutMapping("/{id}")` và `@DeleteMapping("/{id}")`.

### Frontend (Next.js)
1. **`useTablesData.ts`**: Đảm bảo có `mutateTables()` sẵn sàng.
2. **`src/app/tables/page.tsx`**:
   - Thêm state `openDropdownId` để kiểm soát việc mở/đóng menu 3 chấm.
   - Thêm state `editingTable` để quản lý modal sửa tên.
   - Bổ sung UI Menu 3 chấm (Position Absolute).
   - Viết hàm `handleEditTable` và `handleDeleteTable`.

### 4. Logic xử lý(thêm điều kiện)
-Thêm điều kiện khi sửa hoặc xóa bàn nếu bàn đó có trạng thái là "IS_OCCUPIED" thì không cho sửa hoặc xóa.Nếu cố tính sửa hoặc xóa bàn này thì hiện thông báo lỗi toast:"Bàn đang có khách. Không thể sửa hoặc xóa" kèm nút OK ở dưới và không thực hiện sửa hoặc xóa bàn.Nếu bàn đó có trạng thái là "EMPTY" thì thực hiện sửa hoặc xóa bàn.Sau khi sửa hoặc xóa bàn thì hiện thông báo thành công toast:"Sửa hoặc xóa bàn thành công" kèm nút OK ở dưới.Tham khảo thông báo ở trang đặt hàng khi đặt hàng thành công thì khi thông báo lỗi ở trang đặt bàn là dấu X đỏ kèm nội dung tôi đã nói ở trên và nút OK ở dưới.
-Thêm logic để khi người dùng thực hiện sửa tên bàn nếu tên bàn đã tồn tại trong danh sách bàn thì hiện thông báo "Tên bàn đã tồn tại" ở dưới ô nhập tên bàn và không thực hiện sửa.
