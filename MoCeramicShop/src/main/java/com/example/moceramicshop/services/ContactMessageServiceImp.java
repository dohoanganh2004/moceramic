package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.contact.ContactMessageRequestDTO;
import com.example.moceramicshop.dtos.request.contact.ContactMessageStatusUpdateRequestDTO;
import com.example.moceramicshop.dtos.response.contact.ContactMessageResponseDTO;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.ContactMessageMapper;
import com.example.moceramicshop.models.ContactMessage;
import com.example.moceramicshop.repositories.ContactMessageRepository;
import com.example.moceramicshop.specifications.ContactMessageSpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
public class ContactMessageServiceImp implements ContactMessageService {

    private static final String STATUS_NEW = "new";

    private final ContactMessageRepository contactMessageRepository;
    private final ContactMessageMapper contactMessageMapper;

    public ContactMessageServiceImp(ContactMessageRepository contactMessageRepository, ContactMessageMapper contactMessageMapper) {
        this.contactMessageRepository = contactMessageRepository;
        this.contactMessageMapper = contactMessageMapper;
    }

    @Override
    public ContactMessageResponseDTO submit(ContactMessageRequestDTO dto) {
        ContactMessage message = new ContactMessage();
        message.setName(dto.getName());
        message.setEmail(dto.getEmail());
        message.setPhone(dto.getPhone());
        message.setSubject(dto.getSubject());
        message.setMessage(dto.getMessage());
        message.setStatus(STATUS_NEW);
        message.setCreatedAt(Instant.now());

        ContactMessage saved = contactMessageRepository.saveAndFlush(message);
        log.info("Received contact message id={} from email={}", saved.getId(), saved.getEmail());
        return contactMessageMapper.toResponseDTO(saved);
    }

    @Override
    public Page<ContactMessageResponseDTO> search(String search, String status, Pageable pageable) {
        Specification<ContactMessage> spec = Specification
                .where(ContactMessageSpecification.hasNameEmailOrSubjectContaining(search))
                .and(ContactMessageSpecification.hasStatus(status));
        log.info("Searching contact messages: search={} status={} page={}", search, status, pageable);
        return contactMessageRepository.findAll(spec, pageable).map(contactMessageMapper::toResponseDTO);
    }

    @Override
    public ContactMessageResponseDTO getById(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy liên hệ với id " + id));
        return contactMessageMapper.toResponseDTO(message);
    }

    @Override
    public ContactMessageResponseDTO updateStatus(Long id, ContactMessageStatusUpdateRequestDTO dto) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy liên hệ với id " + id));
        message.setStatus(dto.getStatus());
        log.info("Updated contact message id={} status={}", id, dto.getStatus());
        return contactMessageMapper.toResponseDTO(contactMessageRepository.saveAndFlush(message));
    }

    @Override
    public void delete(Long id) {
        if (!contactMessageRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy liên hệ với id " + id);
        }
        contactMessageRepository.deleteById(id);
        log.info("Deleted contact message id={}", id);
    }
}
