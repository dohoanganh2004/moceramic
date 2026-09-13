package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.OrderItem;
import com.example.moceramicshop.repositories.projections.TopProductProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("select oi.variant.product.id as productId, oi.variant.product.name as productName, " +
            "coalesce(sum(oi.quantity), 0) as quantitySold, coalesce(sum(oi.subtotal), 0) as revenue " +
            "from OrderItem oi where oi.order.status <> 'cancelled' " +
            "group by oi.variant.product.id, oi.variant.product.name order by revenue desc")
    List<TopProductProjection> findTopProducts(Pageable pageable);
}
