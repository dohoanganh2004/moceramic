package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.customorder.CustomOrderResponseDTO;
import com.example.moceramicshop.models.CustomOrder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomOrderMapper {
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.fullName")
    @Mapping(target = "attachmentUrls", expression = "java(customOrder.getAttachments().stream().map(com.example.moceramicshop.models.CustomOrderAttachment::getFileUrl).toList())")
    CustomOrderResponseDTO toResponseDTO(CustomOrder customOrder);
}
