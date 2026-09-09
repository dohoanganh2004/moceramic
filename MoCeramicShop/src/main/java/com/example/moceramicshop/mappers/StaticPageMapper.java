package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.staticpage.StaticPageResponseDTO;
import com.example.moceramicshop.models.StaticPage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StaticPageMapper {
    StaticPageResponseDTO toResponseDTO(StaticPage staticPage);
}
