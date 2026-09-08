package com.qlcafe.backend.controller;

import com.qlcafe.backend.dto.RevenueDTO;
import com.qlcafe.backend.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/revenue")
public class RevenueController {

    private final OrderRepository orderRepository;

    public RevenueController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<RevenueDTO>> getRevenueStats(@RequestParam(defaultValue = "day") String type) {
        List<Object[]> rawData;

        switch (type.toLowerCase()) {
            case "month":
                rawData = orderRepository.findMonthlyRevenue();
                break;
            case "year":
                rawData = orderRepository.findYearlyRevenue();
                break;
            default:
                rawData = orderRepository.findDailyRevenue();
                break;
        }

        List<RevenueDTO> result = rawData.stream()
                .map(row -> new RevenueDTO(
                        row[0].toString(),
                        ((Number) row[1]).longValue(),
                        ((Number) row[2]).doubleValue()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
