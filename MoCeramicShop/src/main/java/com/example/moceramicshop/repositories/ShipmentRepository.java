package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ShipmentRepository extends JpaRepository<Shipment, Long>, JpaSpecificationExecutor<Shipment> {
    List<Shipment> findByOrder_IdOrderByCreatedAtDesc(Long orderId);
}
