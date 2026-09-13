package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.CustomOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface CustomOrderRepository extends JpaRepository<CustomOrder, Long>, JpaSpecificationExecutor<CustomOrder> {
    List<CustomOrder> findByUser_IdOrderByCreatedAtDesc(Long userId);
}
