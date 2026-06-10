package com.qlcafe.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. Biến "uploads" thành đường dẫn tuyệt đối chuẩn xác trên máy của bạn
        Path uploadPath = Paths.get(uploadDir);
        String absolutePath = uploadPath.toFile().getAbsolutePath();

        // 2. Map đường dẫn đó vào cấu hình của Spring Boot
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:///" + absolutePath + "/");
        // Lưu ý: Có 3 dấu gạch chéo "file:///" để tương thích tốt nhất với Windows
    }
}
