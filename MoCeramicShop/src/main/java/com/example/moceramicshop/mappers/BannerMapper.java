package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.banner.BannerResponseDTO;
import com.example.moceramicshop.models.Banner;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BannerMapper {
    BannerResponseDTO toResponseDTO(Banner banner);
}
