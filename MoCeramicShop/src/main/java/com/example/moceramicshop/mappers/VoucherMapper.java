package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.voucher.VoucherResponseDTO;
import com.example.moceramicshop.models.Voucher;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VoucherMapper {
    VoucherResponseDTO toResponseDTO(Voucher voucher);
}
