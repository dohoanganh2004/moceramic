package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.response.newsletter.NewsletterSubscriberResponseDTO;
import com.example.moceramicshop.services.NewsletterSubscriberService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/newsletter-subscribers")
public class NewsletterSubscriberController {

    private final NewsletterSubscriberService newsletterSubscriberService;

    public NewsletterSubscriberController(NewsletterSubscriberService newsletterSubscriberService) {
        this.newsletterSubscriberService = newsletterSubscriberService;
    }

    private static final Set<String> SORTABLE_FIELDS = Set.of("email", "subscribedAt", "isActive");

    @GetMapping
    public ResponseEntity<List<NewsletterSubscriberResponseDTO>> getAll() {
        return ResponseEntity.ok(newsletterSubscriberService.getAllSubscribers());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<NewsletterSubscriberResponseDTO>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "subscribedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String field = SORTABLE_FIELDS.contains(sortBy) ? sortBy : "subscribedAt";
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(field).ascending() : Sort.by(field).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);
        return ResponseEntity.ok(newsletterSubscriberService.search(search, isActive, pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        newsletterSubscriberService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
