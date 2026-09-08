package com.qlcafe.backend.controller;
import com.qlcafe.backend.dto.OrderRequest;
import com.qlcafe.backend.dto.OrderUpdateRequest;
import com.qlcafe.backend.dto.MessageResponse;
import com.qlcafe.backend.dto.TopProductDTO;
import com.qlcafe.backend.service.OrderService;
import com.qlcafe.backend.repository.OrderDetailRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final OrderDetailRepository orderDetailRepository;

    public OrderController(OrderService orderService, OrderDetailRepository orderDetailRepository) {
        this.orderService = orderService;
        this.orderDetailRepository = orderDetailRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @PutMapping("/{id}/checkout")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<?> checkout(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.checkout(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<?> getOrderById(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateOrder(@PathVariable Integer id, @RequestBody OrderUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateOrder(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteOrder(@PathVariable Integer id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(new MessageResponse("Đã xóa đơn hàng #" + id + " thành công"));
    }

    @GetMapping("/top-products")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<List<TopProductDTO>> getTopSellingProducts() {
        List<Object[]> rawData = orderDetailRepository.findTopSellingProducts();
        List<TopProductDTO> result = rawData.stream()
                .map(row -> new TopProductDTO(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        ((Number) row[2]).doubleValue()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}

