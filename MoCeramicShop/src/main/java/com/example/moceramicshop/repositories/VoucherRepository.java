package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface VoucherRepository extends JpaRepository<Voucher, Long>, JpaSpecificationExecutor<Voucher> {
    Voucher getVouchersByCode(String code);

    boolean existsByCode(String code);
}
