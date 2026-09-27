package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.inventory.InventoryAdjustRequestDTO;
import com.example.moceramicshop.dtos.response.inventory.InventoryResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InventoryService {
    Page<InventoryResponseDTO> search(String search, Integer lowStockAtMost, Pageable pageable);
    InventoryResponseDTO adjust(Long inventoryId, InventoryAdjustRequestDTO dto);
}
