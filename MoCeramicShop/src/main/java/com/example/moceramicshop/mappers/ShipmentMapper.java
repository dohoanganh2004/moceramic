package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.shipment.ShipmentResponseDTO;
import com.example.moceramicshop.models.Shipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ShipmentMapper {
    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "orderCode", source = "order.orderCode")
    ShipmentResponseDTO toResponseDTO(Shipment shipment);
}
