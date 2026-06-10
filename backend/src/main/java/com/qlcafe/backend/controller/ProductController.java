package com.qlcafe.backend.controller;
import com.qlcafe.backend.dto.MessageResponse;
import com.qlcafe.backend.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    public ProductController(ProductService productService) {
        this.productService = productService;
    }
    
    @GetMapping
    public ResponseEntity<?> getProducts(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size,
                                         @RequestParam(required = false) String search) {
        return ResponseEntity.ok(productService.getAllProducts(page, size, search));
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> createProduct(@RequestParam("name") String name,
                                           @RequestParam("price") Double price,
                                           @RequestParam("categoryId") Integer categoryId,
                                           @RequestParam(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(productService.saveProduct(name, price, categoryId, file));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Integer id,
                                           @RequestParam("name") String name,
                                           @RequestParam("price") Double price,
                                           @RequestParam("categoryId") Integer categoryId,
                                           @RequestParam(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(productService.updateProduct(id, name, price, categoryId, file));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(new MessageResponse("Deleted successfully"));
    }
}
