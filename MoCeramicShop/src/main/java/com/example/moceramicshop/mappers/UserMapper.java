package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.auth.RegisterResponseDTO;
import com.example.moceramicshop.dtos.response.user.UserResponseDTO;
import com.example.moceramicshop.models.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    RegisterResponseDTO toRegisterResponseDTO(User user);

    @Mapping(target = "roleID", source = "role.id")
    @Mapping(target = "roleName", source = "role.name")
    UserResponseDTO toUserResponseDTO(User user);
}
