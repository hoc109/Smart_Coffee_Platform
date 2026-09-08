package com.qlcafe.backend.repository;
import com.qlcafe.backend.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    List<OrderDetail> findByOrderId(Integer orderId);

    // Top-selling products: JOIN with Product, GROUP BY product name, only PAID orders
    @Query("SELECT od.product.name, SUM(od.quantity), SUM(od.quantity * od.price) " +
            "FROM OrderDetail od " +
            "WHERE od.order.status = 'PAID' " +
            "GROUP BY od.product.name " +
            "ORDER BY SUM(od.quantity) DESC")
    List<Object[]> findTopSellingProducts();
}
