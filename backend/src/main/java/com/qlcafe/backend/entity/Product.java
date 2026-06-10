package com.qlcafe.backend.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "Product")
@Data @NoArgsConstructor @AllArgsConstructor
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false)
    private Double price;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    
    @Column(name = "is_available")
    private Boolean isAvailable = true;
}
