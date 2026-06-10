package com.qlcafe.backend.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "Account")
@Data @NoArgsConstructor @AllArgsConstructor
public class Account {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(nullable = false, length = 255)
    private String password;
    
    @Column(nullable = false, length = 20)
    private String role;
}
