package com.qlcafe.backend.repository;
import com.qlcafe.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
public interface ProductRepository extends JpaRepository<Product, Integer> {
    Page<Product> findByNameContainingIgnoreCaseAndIsAvailableTrue(String name, Pageable pageable);
    Page<Product> findByIsAvailableTrue(Pageable pageable);
}
