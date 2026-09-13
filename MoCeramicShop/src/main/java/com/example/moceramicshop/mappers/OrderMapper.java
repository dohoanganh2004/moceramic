package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.order.OrderResponseDTO;
import com.example.moceramicshop.models.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {OrderItemMapper.class, OrderStatusHistoryMapper.class, PaymentMapper.class, ShipmentMapper.class})
public interface OrderMapper {
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.fullName")
    @Mapping(target = "voucherCode", source = "voucher.code")
    OrderResponseDTO toOrderResponseDTO(Order order);
}
