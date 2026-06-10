package com.qlcafe.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private Integer tableId;
    private List<OrderDetailRequest> details;
}
