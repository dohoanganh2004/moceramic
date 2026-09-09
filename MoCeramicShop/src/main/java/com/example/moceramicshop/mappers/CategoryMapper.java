package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.category.CategoryResponseDTO;
import com.example.moceramicshop.models.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentName", source = "parent.name")
    CategoryResponseDTO toResponseDTO(Category category);
}
