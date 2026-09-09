package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.banner.BannerRequestDTO;
import com.example.moceramicshop.dtos.response.banner.BannerResponseDTO;

import java.util.List;

public interface BannerService {
    List<BannerResponseDTO> getAllBanners();
    BannerResponseDTO getBannerById(Long id);
    BannerResponseDTO create(BannerRequestDTO dto);
    BannerResponseDTO update(Long id, BannerRequestDTO dto);
    void delete(Long id);

    List<BannerResponseDTO> getActiveBanners();
}
