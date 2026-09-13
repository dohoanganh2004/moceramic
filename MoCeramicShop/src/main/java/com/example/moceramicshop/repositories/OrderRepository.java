package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Order;
import com.example.moceramicshop.repositories.projections.DailyRevenueProjection;
import com.example.moceramicshop.repositories.projections.OrderStatusCountProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    List<Order> findByUser_Id(Long userId);

    Order getOrderById(Long id);

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o where o.status <> 'cancelled'")
    BigDecimal sumRevenue();

    @Query("select o.status as status, count(o) as cnt from Order o group by o.status")
    List<OrderStatusCountProjection> countByStatus();

    @Query("select function('date', o.createdAt) as day, coalesce(sum(o.totalAmount), 0) as revenue, count(o) as orderCount " +
            "from Order o where o.status <> 'cancelled' and o.createdAt >= :from " +
            "group by function('date', o.createdAt) order by function('date', o.createdAt)")
    List<DailyRevenueProjection> findDailyRevenueSince(@Param("from") Instant from);
}
