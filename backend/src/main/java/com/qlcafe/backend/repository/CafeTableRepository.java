package com.qlcafe.backend.repository;
import com.qlcafe.backend.entity.CafeTable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CafeTableRepository extends JpaRepository<CafeTable, Integer> {
    List<CafeTable> findByStatusNot(String status);
    boolean existsByNameIgnoreCaseAndStatusNotAndIdNot(String name, String status, Integer id);
}
