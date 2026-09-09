package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.OrderItem;
import org.springframework.data.repository.CrudRepository;

public interface OrderItemRepository extends CrudRepository<OrderItem, Long> {
}
