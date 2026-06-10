package com.qlcafe.backend.service;

import com.qlcafe.backend.entity.Category;
import com.qlcafe.backend.entity.Product;
import com.qlcafe.backend.repository.CategoryRepository;
import com.qlcafe.backend.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository,
            FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
    }

    public Page<Product> getAllProducts(int page, int size, String search) {
        if (search != null && !search.isEmpty()) {
            return productRepository.findByNameContainingIgnoreCaseAndIsAvailableTrue(search,
                    PageRequest.of(page, size));
        }
        return productRepository.findByIsAvailableTrue(PageRequest.of(page, size));
    }

    public Product saveProduct(String name, Double price, Integer categoryId, MultipartFile file) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        Product product = new Product();
        product.setName(name);
        product.setPrice(price);
        product.setCategory(category);
        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            product.setImageUrl(fileName);
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Integer id, String name, Double price, Integer categoryId, MultipartFile file) {
        Product product = productRepository.findById(id).orElseThrow();
        Category category = categoryRepository.findById(categoryId).orElseThrow();
        product.setName(name);
        product.setPrice(price);
        product.setCategory(category);
        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            product.setImageUrl(fileName);
        }
        return productRepository.save(product);
    }

    public void deleteProduct(Integer id) {
        Product product = productRepository.findById(id).orElseThrow();
        product.setIsAvailable(false); // soft delete
        productRepository.save(product);
    }
}
