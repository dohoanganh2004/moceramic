package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.voucher.VoucherRequestDTO;
import com.example.moceramicshop.dtos.response.voucher.VoucherResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface VoucherService {
    List<VoucherResponseDTO> getAllVouchers();
    Page<VoucherResponseDTO> search(String search, String discountType, Boolean isActive, Pageable pageable);
    VoucherResponseDTO getVoucherById(Long id);
    VoucherResponseDTO create(VoucherRequestDTO dto);
    VoucherResponseDTO update(Long id, VoucherRequestDTO dto);
    void delete(Long id);
}
