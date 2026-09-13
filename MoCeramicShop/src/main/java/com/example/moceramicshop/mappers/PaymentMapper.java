package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.order.PaymentResponseDTO;
import com.example.moceramicshop.models.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "orderCode", source = "order.orderCode")
    PaymentResponseDTO toResponseDTO(Payment payment);
}
