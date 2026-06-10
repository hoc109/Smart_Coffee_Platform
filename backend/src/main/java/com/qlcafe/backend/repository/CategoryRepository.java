package com.qlcafe.backend.repository;
import com.qlcafe.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CategoryRepository extends JpaRepository<Category, Integer> {
}
