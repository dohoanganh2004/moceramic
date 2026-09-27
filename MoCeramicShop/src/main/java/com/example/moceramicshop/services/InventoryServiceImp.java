package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.inventory.InventoryAdjustRequestDTO;
import com.example.moceramicshop.dtos.response.inventory.InventoryResponseDTO;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.InventoryMapper;
import com.example.moceramicshop.models.Inventory;
import com.example.moceramicshop.repositories.InventoryRepository;
import com.example.moceramicshop.specifications.InventorySpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
public class InventoryServiceImp implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMapper inventoryMapper;

    public InventoryServiceImp(InventoryRepository inventoryRepository, InventoryMapper inventoryMapper) {
        this.inventoryRepository = inventoryRepository;
        this.inventoryMapper = inventoryMapper;
    }

    @Override
    public Page<InventoryResponseDTO> search(String search, Integer lowStockAtMost, Pageable pageable) {
        Specification<Inventory> spec = Specification
                .where(InventorySpecification.hasProductOrSkuContaining(search))
                .and(InventorySpecification.hasAvailableAtMost(lowStockAtMost));
        return inventoryRepository.findAll(spec, pageable).map(inventoryMapper::toResponseDTO);
    }

    @Override
    public InventoryResponseDTO adjust(Long inventoryId, InventoryAdjustRequestDTO dto) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tồn kho với id " + inventoryId));
        int previous = inventory.getQuantityOnHand();
        inventory.setQuantityOnHand(dto.getQuantityOnHand());
        inventory.setUpdatedAt(Instant.now());
        Inventory saved = inventoryRepository.save(inventory);
        log.info("Adjusted inventory id={} variantId={} quantityOnHand {} -> {}",
                inventoryId, inventory.getVariant().getId(), previous, dto.getQuantityOnHand());
        return inventoryMapper.toResponseDTO(saved);
    }
}
