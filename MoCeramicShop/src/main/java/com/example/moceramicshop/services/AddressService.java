package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.address.AddressRequestDTO;
import com.example.moceramicshop.dtos.response.address.AddressResponseDTO;

import java.util.List;

public interface AddressService {
    List<AddressResponseDTO> getAllByCurrentUser(Long currentUserID);
    AddressResponseDTO create(Long currentUserID ,AddressRequestDTO request);
    AddressResponseDTO update(Long currentUserID,Long id, AddressRequestDTO request);
    AddressResponseDTO delete(Long currentUserID ,Long id);
    AddressResponseDTO setDefault(Long currentUserID, Long id);
}
