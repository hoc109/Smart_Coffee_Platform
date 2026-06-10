package com.qlcafe.backend.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "CafeTable")
@Data @NoArgsConstructor @AllArgsConstructor
public class CafeTable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "name", nullable = false, length = 50)
    private String name;
    
    @Column(length = 20)
    private String status = "AVAILABLE";
}
