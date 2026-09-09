package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.address.AddressResponseDTO;
import com.example.moceramicshop.models.Address;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    @Mapping(target = "userId", source = "user.id")
    AddressResponseDTO toResponseDTO(Address address);
}
