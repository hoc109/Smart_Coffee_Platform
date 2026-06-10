package com.qlcafe.backend.repository;
import com.qlcafe.backend.entity.CafeTable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CafeTableRepository extends JpaRepository<CafeTable, Integer> {
}
