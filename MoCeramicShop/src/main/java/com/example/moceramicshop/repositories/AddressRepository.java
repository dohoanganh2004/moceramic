package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {

    Address getAddressById(Long id);

    List<Address> findByUser_Id(Long userId);
}
