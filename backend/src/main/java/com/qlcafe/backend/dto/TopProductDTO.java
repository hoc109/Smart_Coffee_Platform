package com.qlcafe.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopProductDTO {
    private String productName;
    private Long totalQuantity;
    private Double totalRevenue;
}
