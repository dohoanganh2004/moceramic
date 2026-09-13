package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.shipment.ShipmentRequestDTO;
import com.example.moceramicshop.dtos.response.shipment.ShipmentResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ShipmentService {
    ShipmentResponseDTO create(ShipmentRequestDTO dto);
    ShipmentResponseDTO update(Long id, ShipmentRequestDTO dto);
    Page<ShipmentResponseDTO> search(String search, String status, Pageable pageable);
    List<ShipmentResponseDTO> getByOrderId(Long orderId, Long requestingUserId);
    void delete(Long id);
}
