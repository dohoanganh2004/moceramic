package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.customorder.CustomOrderAdminUpdateRequestDTO;
import com.example.moceramicshop.dtos.request.customorder.CustomOrderRequestDTO;
import com.example.moceramicshop.dtos.response.customorder.CustomOrderResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CustomOrderService {
    CustomOrderResponseDTO submit(Long userId, CustomOrderRequestDTO dto, List<MultipartFile> files);
    List<CustomOrderResponseDTO> getMyRequests(Long userId);
    Page<CustomOrderResponseDTO> search(String search, String status, Pageable pageable);
    CustomOrderResponseDTO getById(Long id);
    CustomOrderResponseDTO getOwnedById(Long id, Long userId);
    CustomOrderResponseDTO adminUpdate(Long id, CustomOrderAdminUpdateRequestDTO dto);
    void delete(Long id);
}
