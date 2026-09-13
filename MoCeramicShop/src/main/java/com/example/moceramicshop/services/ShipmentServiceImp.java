package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.shipment.ShipmentRequestDTO;
import com.example.moceramicshop.dtos.response.shipment.ShipmentResponseDTO;
import com.example.moceramicshop.exceptions.ForbiddenException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.ShipmentMapper;
import com.example.moceramicshop.models.Order;
import com.example.moceramicshop.models.Shipment;
import com.example.moceramicshop.repositories.OrderRepository;
import com.example.moceramicshop.repositories.ShipmentRepository;
import com.example.moceramicshop.specifications.ShipmentSpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Slf4j
@Service
public class ShipmentServiceImp implements ShipmentService {

    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_DELIVERED = "delivered";

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final ShipmentMapper shipmentMapper;

    public ShipmentServiceImp(ShipmentRepository shipmentRepository, OrderRepository orderRepository, ShipmentMapper shipmentMapper) {
        this.shipmentRepository = shipmentRepository;
        this.orderRepository = orderRepository;
        this.shipmentMapper = shipmentMapper;
    }

    @Override
    public ShipmentResponseDTO create(ShipmentRequestDTO dto) {
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id " + dto.getOrderId()));

        Shipment shipment = new Shipment();
        shipment.setOrder(order);
        applyRequest(shipment, dto);
        shipment.setCreatedAt(Instant.now());
        shipment.setUpdatedAt(Instant.now());

        Shipment saved = shipmentRepository.saveAndFlush(shipment);
        log.info("Created shipment id={} for orderId={}", saved.getId(), order.getId());
        return shipmentMapper.toResponseDTO(saved);
    }

    @Override
    public ShipmentResponseDTO update(Long id, ShipmentRequestDTO dto) {
        Shipment shipment = findOrThrow(id);
        applyRequest(shipment, dto);
        shipment.setUpdatedAt(Instant.now());
        log.info("Updated shipment id={} status={}", id, shipment.getStatus());
        return shipmentMapper.toResponseDTO(shipmentRepository.saveAndFlush(shipment));
    }

    @Override
    public Page<ShipmentResponseDTO> search(String search, String status, Pageable pageable) {
        Specification<Shipment> spec = Specification
                .where(ShipmentSpecification.hasTrackingCodeOrOrderCodeContaining(search))
                .and(ShipmentSpecification.hasStatus(status));
        log.info("Searching shipments: search={} status={} page={}", search, status, pageable);
        return shipmentRepository.findAll(spec, pageable).map(shipmentMapper::toResponseDTO);
    }

    @Override
    public List<ShipmentResponseDTO> getByOrderId(Long orderId, Long requestingUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id " + orderId));
        if (!order.getUser().getId().equals(requestingUserId)) {
            throw new ForbiddenException("Bạn không có quyền xem đơn hàng này");
        }
        return shipmentRepository.findByOrder_IdOrderByCreatedAtDesc(orderId).stream()
                .map(shipmentMapper::toResponseDTO)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!shipmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy vận đơn với id " + id);
        }
        shipmentRepository.deleteById(id);
        log.info("Deleted shipment id={}", id);
    }

    private void applyRequest(Shipment shipment, ShipmentRequestDTO dto) {
        shipment.setCarrier(dto.getCarrier());
        shipment.setTrackingCode(dto.getTrackingCode());
        String status = dto.getStatus() != null ? dto.getStatus() : STATUS_PENDING;
        boolean transitioningToDelivered = STATUS_DELIVERED.equals(status) && !STATUS_DELIVERED.equals(shipment.getStatus());
        shipment.setStatus(status);
        shipment.setShippingFee(dto.getShippingFee() != null ? dto.getShippingFee() : BigDecimal.ZERO);
        shipment.setEstimatedDelivery(dto.getEstimatedDelivery());
        if (transitioningToDelivered) {
            shipment.setDeliveredAt(Instant.now());
        }
    }

    private Shipment findOrThrow(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vận đơn với id " + id));
    }
}
