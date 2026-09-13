package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.contact.ContactMessageResponseDTO;
import com.example.moceramicshop.models.ContactMessage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ContactMessageMapper {
    ContactMessageResponseDTO toResponseDTO(ContactMessage contactMessage);
}
