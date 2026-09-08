package com.qlcafe.backend.repository;

import com.qlcafe.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // ===== Revenue Statistics Queries =====

    @Query("SELECT CAST(o.createdAt AS date) AS period, COUNT(o) AS totalOrders, COALESCE(SUM(o.totalAmount), 0) AS totalRevenue " +
            "FROM Order o WHERE o.status = 'PAID' " +
            "GROUP BY CAST(o.createdAt AS date) " +
            "ORDER BY CAST(o.createdAt AS date) DESC")
    List<Object[]> findDailyRevenue();

    @Query("SELECT CONCAT(YEAR(o.createdAt), '-', " +
            "CASE WHEN MONTH(o.createdAt) < 10 THEN CONCAT('0', MONTH(o.createdAt)) ELSE CAST(MONTH(o.createdAt) AS string) END) AS period, " +
            "COUNT(o) AS totalOrders, COALESCE(SUM(o.totalAmount), 0) AS totalRevenue " +
            "FROM Order o WHERE o.status = 'PAID' " +
            "GROUP BY YEAR(o.createdAt), MONTH(o.createdAt) " +
            "ORDER BY YEAR(o.createdAt) DESC, MONTH(o.createdAt) DESC")
    List<Object[]> findMonthlyRevenue();

    @Query("SELECT CAST(YEAR(o.createdAt) AS string) AS period, COUNT(o) AS totalOrders, COALESCE(SUM(o.totalAmount), 0) AS totalRevenue " +
            "FROM Order o WHERE o.status = 'PAID' " +
            "GROUP BY YEAR(o.createdAt) " +
            "ORDER BY YEAR(o.createdAt) DESC")
    List<Object[]> findYearlyRevenue();
}
