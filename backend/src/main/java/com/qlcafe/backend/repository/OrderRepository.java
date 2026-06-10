package com.qlcafe.backend.repository;

import com.qlcafe.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}
