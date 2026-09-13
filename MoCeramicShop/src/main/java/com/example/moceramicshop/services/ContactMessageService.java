package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.contact.ContactMessageRequestDTO;
import com.example.moceramicshop.dtos.request.contact.ContactMessageStatusUpdateRequestDTO;
import com.example.moceramicshop.dtos.response.contact.ContactMessageResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ContactMessageService {
    ContactMessageResponseDTO submit(ContactMessageRequestDTO dto);
    Page<ContactMessageResponseDTO> search(String search, String status, Pageable pageable);
    ContactMessageResponseDTO getById(Long id);
    ContactMessageResponseDTO updateStatus(Long id, ContactMessageStatusUpdateRequestDTO dto);
    void delete(Long id);
}
