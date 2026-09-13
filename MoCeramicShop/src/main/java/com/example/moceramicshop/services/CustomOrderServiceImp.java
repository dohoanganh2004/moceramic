package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.customorder.CustomOrderAdminUpdateRequestDTO;
import com.example.moceramicshop.dtos.request.customorder.CustomOrderRequestDTO;
import com.example.moceramicshop.dtos.response.customorder.CustomOrderResponseDTO;
import com.example.moceramicshop.exceptions.ForbiddenException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.CustomOrderMapper;
import com.example.moceramicshop.models.CustomOrder;
import com.example.moceramicshop.models.CustomOrderAttachment;
import com.example.moceramicshop.models.User;
import com.example.moceramicshop.repositories.CustomOrderRepository;
import com.example.moceramicshop.repositories.UserRepository;
import com.example.moceramicshop.specifications.CustomOrderSpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
public class CustomOrderServiceImp implements CustomOrderService {

    private static final String STATUS_REQUESTED = "requested";

    private final CustomOrderRepository customOrderRepository;
    private final UserRepository userRepository;
    private final CustomOrderMapper customOrderMapper;
    private final FileStorageService fileStorageService;

    public CustomOrderServiceImp(CustomOrderRepository customOrderRepository, UserRepository userRepository,
                                  CustomOrderMapper customOrderMapper, FileStorageService fileStorageService) {
        this.customOrderRepository = customOrderRepository;
        this.userRepository = userRepository;
        this.customOrderMapper = customOrderMapper;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public CustomOrderResponseDTO submit(Long userId, CustomOrderRequestDTO dto, List<MultipartFile> files) {
        CustomOrder customOrder = new CustomOrder();
        if (userId != null) {
            User user = userRepository.getUserById(userId);
            customOrder.setUser(user);
        }
        customOrder.setContactName(dto.getContactName());
        customOrder.setContactEmail(dto.getContactEmail());
        customOrder.setContactPhone(dto.getContactPhone());
        customOrder.setDescription(dto.getDescription());
        customOrder.setQuantity(dto.getQuantity());
        customOrder.setDesiredCompletionDate(dto.getDesiredCompletionDate());
        customOrder.setStatus(STATUS_REQUESTED);
        customOrder.setCreatedAt(Instant.now());
        customOrder.setUpdatedAt(Instant.now());

        if (files != null) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) {
                    continue;
                }
                CustomOrderAttachment attachment = new CustomOrderAttachment();
                attachment.setFileUrl(fileStorageService.store(file));
                attachment.setCreatedAt(Instant.now());
                attachment.setCustomOrder(customOrder);
                customOrder.getAttachments().add(attachment);
            }
        }

        CustomOrder saved = customOrderRepository.saveAndFlush(customOrder);
        log.info("Received custom order id={} userId={}", saved.getId(), userId);
        return customOrderMapper.toResponseDTO(saved);
    }

    @Override
    public List<CustomOrderResponseDTO> getMyRequests(Long userId) {
        return customOrderRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
                .map(customOrderMapper::toResponseDTO)
                .toList();
    }

    @Override
    public Page<CustomOrderResponseDTO> search(String search, String status, Pageable pageable) {
        Specification<CustomOrder> spec = Specification
                .where(CustomOrderSpecification.hasContactInfoOrDescriptionContaining(search))
                .and(CustomOrderSpecification.hasStatus(status));
        log.info("Searching custom orders: search={} status={} page={}", search, status, pageable);
        return customOrderRepository.findAll(spec, pageable).map(customOrderMapper::toResponseDTO);
    }

    @Override
    public CustomOrderResponseDTO getById(Long id) {
        CustomOrder customOrder = findOrThrow(id);
        return customOrderMapper.toResponseDTO(customOrder);
    }

    @Override
    public CustomOrderResponseDTO getOwnedById(Long id, Long userId) {
        CustomOrder customOrder = findOrThrow(id);
        if (customOrder.getUser() == null || !customOrder.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Bạn không có quyền xem đơn đặt hàng này");
        }
        return customOrderMapper.toResponseDTO(customOrder);
    }

    @Override
    public CustomOrderResponseDTO adminUpdate(Long id, CustomOrderAdminUpdateRequestDTO dto) {
        CustomOrder customOrder = findOrThrow(id);
        customOrder.setStatus(dto.getStatus());
        customOrder.setQuotedPrice(dto.getQuotedPrice());
        customOrder.setAdminNote(dto.getAdminNote());
        customOrder.setUpdatedAt(Instant.now());
        log.info("Updated custom order id={} status={}", id, dto.getStatus());
        return customOrderMapper.toResponseDTO(customOrderRepository.saveAndFlush(customOrder));
    }

    @Override
    public void delete(Long id) {
        CustomOrder customOrder = findOrThrow(id);
        for (CustomOrderAttachment attachment : customOrder.getAttachments()) {
            fileStorageService.delete(attachment.getFileUrl());
        }
        customOrderRepository.deleteById(id);
        log.info("Deleted custom order id={}", id);
    }

    private CustomOrder findOrThrow(Long id) {
        return customOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt hàng với id " + id));
    }
}
