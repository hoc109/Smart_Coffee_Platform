package com.qlcafe.backend.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "Category")
@Data @NoArgsConstructor @AllArgsConstructor
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(length = 255)
    private String description;
}
