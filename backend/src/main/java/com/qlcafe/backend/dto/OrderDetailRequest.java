package com.qlcafe.backend.dto;

import lombok.Data;

@Data
public class OrderDetailRequest {
    private Integer productId;
    private Integer quantity;
}
