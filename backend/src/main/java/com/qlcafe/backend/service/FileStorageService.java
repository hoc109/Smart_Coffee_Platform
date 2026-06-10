package com.qlcafe.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Service xử lý upload file ảnh lên Cloudinary.
 * Ảnh sẽ được lưu vĩnh viễn trên cloud, không bị mất khi restart container.
 * Trả về secure_url (HTTPS) để lưu vào database.
 */
@Service
public class FileStorageService {

    private final Cloudinary cloudinary;

    public FileStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Upload ảnh lên Cloudinary và trả về URL đầy đủ (HTTPS).
     * URL được lưu vào cột image_url của bảng Product.
     */
    @SuppressWarnings("unchecked")
    public String storeFile(MultipartFile file) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder",          "qlcafe-products",  // Thư mục trong Cloudinary
                            "resource_type",   "image",
                            "use_filename",    false,
                            "unique_filename", true
                    )
            );
            // Trả về secure_url (HTTPS) — VD: https://res.cloudinary.com/xxx/image/upload/...
            return (String) uploadResult.get("secure_url");
        } catch (IOException ex) {
            throw new RuntimeException("Không thể upload ảnh lên Cloudinary: " + ex.getMessage(), ex);
        }
    }
}
