package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.order.PaymentResponseDTO;
import com.example.moceramicshop.models.Payment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    PaymentResponseDTO toResponseDTO(Payment payment);
}
