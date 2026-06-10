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
        return cafeTableRepository.findAll();
    }

    public CafeTable saveTable(CafeTable table) {
        return cafeTableRepository.save(table);
    }

    public CafeTable updateTableStatus(Integer id, String status) {
        CafeTable table = cafeTableRepository.findById(id).orElseThrow();
        table.setStatus(status);
        return cafeTableRepository.save(table);
    }
}
