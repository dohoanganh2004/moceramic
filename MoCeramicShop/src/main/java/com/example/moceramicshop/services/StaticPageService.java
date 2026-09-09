package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.staticpage.StaticPageRequestDTO;
import com.example.moceramicshop.dtos.response.staticpage.StaticPageResponseDTO;

import java.util.List;

public interface StaticPageService {
    List<StaticPageResponseDTO> getAllPages();
    StaticPageResponseDTO getPageById(Long id);
    StaticPageResponseDTO create(StaticPageRequestDTO dto);
    StaticPageResponseDTO update(Long id, StaticPageRequestDTO dto);
    void delete(Long id);

    StaticPageResponseDTO getPageBySlug(String slug);
}
