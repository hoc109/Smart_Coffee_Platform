package com.qlcafe.backend.dto;

import lombok.Data;

@Data
public class AccountRequest {
    private String username;
    private String password;
    private String role;
}
