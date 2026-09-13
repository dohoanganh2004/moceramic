package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.voucher.VoucherRequestDTO;
import com.example.moceramicshop.dtos.response.voucher.VoucherResponseDTO;
import com.example.moceramicshop.exceptions.BadRequestException;
import com.example.moceramicshop.exceptions.ConflictException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.VoucherMapper;
import com.example.moceramicshop.models.Voucher;
import com.example.moceramicshop.repositories.VoucherRepository;
import com.example.moceramicshop.specifications.VoucherSpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Slf4j
@Service
public class VoucherServiceImp implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherMapper voucherMapper;

    public VoucherServiceImp(VoucherRepository voucherRepository, VoucherMapper voucherMapper) {
        this.voucherRepository = voucherRepository;
        this.voucherMapper = voucherMapper;
    }

    @Override
    public List<VoucherResponseDTO> getAllVouchers() {
        return voucherRepository.findAll().stream()
                .map(voucherMapper::toResponseDTO)
                .toList();
    }

    @Override
    public Page<VoucherResponseDTO> search(String search, String discountType, Boolean isActive, Pageable pageable) {
        Specification<Voucher> spec = Specification
                .where(VoucherSpecification.hasCodeOrDescriptionContaining(search))
                .and(VoucherSpecification.hasDiscountType(discountType))
                .and(VoucherSpecification.hasIsActive(isActive));
        log.info("Searching vouchers: search={} discountType={} isActive={} page={}", search, discountType, isActive, pageable);
        return voucherRepository.findAll(spec, pageable).map(voucherMapper::toResponseDTO);
    }

    @Override
    public VoucherResponseDTO getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher với id " + id));
        return voucherMapper.toResponseDTO(voucher);
    }

    @Override
    public VoucherResponseDTO create(VoucherRequestDTO dto) {
        if (voucherRepository.existsByCode(dto.getCode())) {
            throw new ConflictException("Mã voucher đã tồn tại, vui lòng chọn mã khác");
        }
        validateBusinessRules(dto);

        Voucher voucher = new Voucher();
        voucher.setCode(dto.getCode());
        voucher.setDescription(dto.getDescription());
        voucher.setDiscountType(dto.getDiscountType());
        voucher.setDiscountValue(dto.getDiscountValue());
        voucher.setMinOrderAmount(dto.getMinOrderAmount() != null ? dto.getMinOrderAmount() : BigDecimal.ZERO);
        voucher.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        voucher.setStartDate(dto.getStartDate());
        voucher.setEndDate(dto.getEndDate());
        voucher.setUsageLimit(dto.getUsageLimit());
        voucher.setUsedCount(0);
        voucher.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        voucher.setCreatedAt(Instant.now());
        voucher.setUpdatedAt(Instant.now());

        Voucher saved = voucherRepository.saveAndFlush(voucher);
        log.info("Created voucher id={} code={}", saved.getId(), saved.getCode());
        return voucherMapper.toResponseDTO(saved);
    }

    @Override
    public VoucherResponseDTO update(Long id, VoucherRequestDTO dto) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher với id " + id));

        if (!voucher.getCode().equals(dto.getCode()) && voucherRepository.existsByCode(dto.getCode())) {
            throw new ConflictException("Mã voucher đã tồn tại, vui lòng chọn mã khác");
        }
        validateBusinessRules(dto);

        voucher.setCode(dto.getCode());
        voucher.setDescription(dto.getDescription());
        voucher.setDiscountType(dto.getDiscountType());
        voucher.setDiscountValue(dto.getDiscountValue());
        voucher.setMinOrderAmount(dto.getMinOrderAmount() != null ? dto.getMinOrderAmount() : BigDecimal.ZERO);
        voucher.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        voucher.setStartDate(dto.getStartDate());
        voucher.setEndDate(dto.getEndDate());
        voucher.setUsageLimit(dto.getUsageLimit());
        if (dto.getIsActive() != null) {
            voucher.setIsActive(dto.getIsActive());
        }
        voucher.setUpdatedAt(Instant.now());

        log.info("Updated voucher id={}", id);
        return voucherMapper.toResponseDTO(voucherRepository.saveAndFlush(voucher));
    }

    @Override
    public void delete(Long id) {
        if (!voucherRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy voucher với id " + id);
        }
        voucherRepository.deleteById(id);
        log.info("Deleted voucher id={}", id);
    }

    private void validateBusinessRules(VoucherRequestDTO dto) {
        if ("percentage".equalsIgnoreCase(dto.getDiscountType())
                && dto.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException("Giá trị giảm theo phần trăm không được vượt quá 100");
        }
        if (dto.getStartDate() != null && dto.getEndDate() != null
                && !dto.getEndDate().isAfter(dto.getStartDate())) {
            throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu");
        }
    }
}
