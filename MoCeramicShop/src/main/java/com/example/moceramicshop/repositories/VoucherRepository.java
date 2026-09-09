package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
}
