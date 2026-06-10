package com.qlcafe.backend.controller;
import com.qlcafe.backend.entity.Category;
import com.qlcafe.backend.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.saveCategory(category));
    }
}
