package com.qlcafe.backend.service;

import com.qlcafe.backend.entity.CafeTable;
import com.qlcafe.backend.repository.CafeTableRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CafeTableService {
    private final CafeTableRepository cafeTableRepository;

    public CafeTableService(CafeTableRepository cafeTableRepository) {
        this.cafeTableRepository = cafeTableRepository;
    }

    public List<CafeTable> getAllTables() {
        return cafeTableRepository.findByStatusNot("DELETED");
    }

    public CafeTable saveTable(CafeTable table) {
        return cafeTableRepository.save(table);
    }

    public CafeTable updateTableStatus(Integer id, String status) {
        CafeTable table = cafeTableRepository.findById(id).orElseThrow();
        table.setStatus(status);
        return cafeTableRepository.save(table);
    }

    public CafeTable updateTable(Integer id, String newName) {
        CafeTable table = cafeTableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));
        if ("OCCUPIED".equalsIgnoreCase(table.getStatus())) {
            throw new RuntimeException("Bàn đang có khách. Không thể sửa hoặc xóa");
        }
        if (cafeTableRepository.existsByNameIgnoreCaseAndStatusNotAndIdNot(newName, "DELETED", id)) {
            throw new RuntimeException("Tên bàn đã tồn tại");
        }
        table.setName(newName);
        return cafeTableRepository.save(table);
    }

    public CafeTable deleteTable(Integer id) {
        CafeTable table = cafeTableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));
        if ("OCCUPIED".equalsIgnoreCase(table.getStatus())) {
            throw new RuntimeException("Bàn đang có khách. Không thể sửa hoặc xóa");
        }
        table.setStatus("DELETED");
        return cafeTableRepository.save(table);
    }
}
