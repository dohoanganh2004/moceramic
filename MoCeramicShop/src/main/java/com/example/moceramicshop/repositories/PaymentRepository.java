package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {
    List<Payment> findByOrder_IdOrderByCreatedAtDesc(Long orderId);
}
