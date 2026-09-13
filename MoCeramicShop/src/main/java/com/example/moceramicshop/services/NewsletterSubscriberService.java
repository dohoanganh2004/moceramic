package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.response.newsletter.NewsletterSubscriberResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NewsletterSubscriberService {
    NewsletterSubscriberResponseDTO subscribe(String email);
    List<NewsletterSubscriberResponseDTO> getAllSubscribers();
    Page<NewsletterSubscriberResponseDTO> search(String search, Boolean isActive, Pageable pageable);
    void delete(Long id);
}
