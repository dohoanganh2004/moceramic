package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.contact.ContactMessageStatusUpdateRequestDTO;
import com.example.moceramicshop.dtos.response.contact.ContactMessageResponseDTO;
import com.example.moceramicshop.services.ContactMessageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/contact-messages")
public class ContactMessageController {

    private final ContactMessageService contactMessageService;

    public ContactMessageController(ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }

    private static final Set<String> SORTABLE_FIELDS = Set.of("name", "email", "status", "createdAt");

    @GetMapping("/search")
    public ResponseEntity<Page<ContactMessageResponseDTO>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String field = SORTABLE_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(field).ascending() : Sort.by(field).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);
        return ResponseEntity.ok(contactMessageService.search(search, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactMessageResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contactMessageService.getById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ContactMessageResponseDTO> updateStatus(@PathVariable Long id,
                                                                    @Valid @RequestBody ContactMessageStatusUpdateRequestDTO dto) {
        return ResponseEntity.ok(contactMessageService.updateStatus(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactMessageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
