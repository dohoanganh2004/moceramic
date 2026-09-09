package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Order;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface OrderRepository extends CrudRepository<Order, Long> {
    List<Order> findByUser_Id(Long userId);
}
