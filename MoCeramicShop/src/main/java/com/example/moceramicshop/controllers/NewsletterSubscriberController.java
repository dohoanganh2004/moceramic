package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.response.newsletter.NewsletterSubscriberResponseDTO;
import com.example.moceramicshop.services.NewsletterSubscriberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/newsletter-subscribers")
public class NewsletterSubscriberController {

    private final NewsletterSubscriberService newsletterSubscriberService;

    public NewsletterSubscriberController(NewsletterSubscriberService newsletterSubscriberService) {
        this.newsletterSubscriberService = newsletterSubscriberService;
    }

    @GetMapping
    public ResponseEntity<List<NewsletterSubscriberResponseDTO>> getAll() {
        return ResponseEntity.ok(newsletterSubscriberService.getAllSubscribers());
    }
}
