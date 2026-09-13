package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.payment.PaymentRequestDTO;
import com.example.moceramicshop.dtos.request.payment.PaymentStatusUpdateRequestDTO;
import com.example.moceramicshop.dtos.response.order.PaymentResponseDTO;
import com.example.moceramicshop.exceptions.ForbiddenException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.PaymentMapper;
import com.example.moceramicshop.models.Order;
import com.example.moceramicshop.models.Payment;
import com.example.moceramicshop.repositories.OrderRepository;
import com.example.moceramicshop.repositories.PaymentRepository;
import com.example.moceramicshop.specifications.PaymentSpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
public class PaymentServiceImp implements PaymentService {

    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_PAID = "paid";

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentMapper paymentMapper;

    public PaymentServiceImp(PaymentRepository paymentRepository, OrderRepository orderRepository, PaymentMapper paymentMapper) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.paymentMapper = paymentMapper;
    }

    @Override
    public PaymentResponseDTO create(PaymentRequestDTO dto) {
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id " + dto.getOrderId()));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(dto.getMethod());
        payment.setAmount(dto.getAmount());
        payment.setStatus(dto.getStatus() != null ? dto.getStatus() : STATUS_PENDING);
        payment.setTransactionRef(dto.getTransactionRef());
        payment.setCreatedAt(Instant.now());
        if (STATUS_PAID.equals(payment.getStatus())) {
            payment.setPaidAt(Instant.now());
        }

        Payment saved = paymentRepository.saveAndFlush(payment);
        log.info("Created payment id={} for orderId={} method={} status={}", saved.getId(), order.getId(), saved.getMethod(), saved.getStatus());
        return paymentMapper.toResponseDTO(saved);
    }

    @Override
    public Payment createForOrder(Order order, String method) {
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(method != null ? method : "cod");
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(STATUS_PENDING);
        payment.setCreatedAt(Instant.now());

        Payment saved = paymentRepository.saveAndFlush(payment);
        // order.payments is still the plain ArrayList from the field initializer at this point
        // (the order was just persisted, never re-loaded from the DB), so it won't pick up this
        // new row on its own - add it explicitly so the very first response reflects it too.
        order.getPayments().add(saved);
        log.info("Auto-created payment id={} for orderId={} method={}", saved.getId(), order.getId(), saved.getMethod());
        return saved;
    }

    @Override
    public PaymentResponseDTO updateStatus(Long id, PaymentStatusUpdateRequestDTO dto) {
        Payment payment = findOrThrow(id);
        boolean transitioningToPaid = STATUS_PAID.equals(dto.getStatus()) && !STATUS_PAID.equals(payment.getStatus());
        payment.setStatus(dto.getStatus());
        if (dto.getTransactionRef() != null) {
            payment.setTransactionRef(dto.getTransactionRef());
        }
        if (transitioningToPaid) {
            payment.setPaidAt(Instant.now());
        }
        log.info("Updated payment id={} status={}", id, dto.getStatus());
        return paymentMapper.toResponseDTO(paymentRepository.saveAndFlush(payment));
    }

    @Override
    public Page<PaymentResponseDTO> search(String search, String method, String status, Pageable pageable) {
        Specification<Payment> spec = Specification
                .where(PaymentSpecification.hasOrderCodeOrTransactionRefContaining(search))
                .and(PaymentSpecification.hasMethod(method))
                .and(PaymentSpecification.hasStatus(status));
        log.info("Searching payments: search={} method={} status={} page={}", search, method, status, pageable);
        return paymentRepository.findAll(spec, pageable).map(paymentMapper::toResponseDTO);
    }

    @Override
    public List<PaymentResponseDTO> getByOrderId(Long orderId, Long requestingUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id " + orderId));
        if (!order.getUser().getId().equals(requestingUserId)) {
            throw new ForbiddenException("Bạn không có quyền xem đơn hàng này");
        }
        return paymentRepository.findByOrder_IdOrderByCreatedAtDesc(orderId).stream()
                .map(paymentMapper::toResponseDTO)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy giao dịch thanh toán với id " + id);
        }
        paymentRepository.deleteById(id);
        log.info("Deleted payment id={}", id);
    }

    private Payment findOrThrow(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch thanh toán với id " + id));
    }
}
