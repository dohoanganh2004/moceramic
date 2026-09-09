package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.order.OrderStatusHistoryResponseDTO;
import com.example.moceramicshop.models.OrderStatusHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderStatusHistoryMapper {
    @Mapping(target = "changedByUserId", source = "changedBy.id")
    @Mapping(target = "changedByName", source = "changedBy.fullName")
    OrderStatusHistoryResponseDTO toResponseDTO(OrderStatusHistory history);
}
