package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.payment.PaymentRequestDTO;
import com.example.moceramicshop.dtos.request.payment.PaymentStatusUpdateRequestDTO;
import com.example.moceramicshop.dtos.response.order.PaymentResponseDTO;
import com.example.moceramicshop.models.Order;
import com.example.moceramicshop.models.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PaymentService {
    PaymentResponseDTO create(PaymentRequestDTO dto);
    Payment createForOrder(Order order, String method);
    PaymentResponseDTO updateStatus(Long id, PaymentStatusUpdateRequestDTO dto);
    Page<PaymentResponseDTO> search(String search, String method, String status, Pageable pageable);
    List<PaymentResponseDTO> getByOrderId(Long orderId, Long requestingUserId);
    void delete(Long id);
}
