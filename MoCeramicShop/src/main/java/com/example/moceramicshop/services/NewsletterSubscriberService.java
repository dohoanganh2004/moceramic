package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.response.newsletter.NewsletterSubscriberResponseDTO;

import java.util.List;

public interface NewsletterSubscriberService {
    NewsletterSubscriberResponseDTO subscribe(String email);
    List<NewsletterSubscriberResponseDTO> getAllSubscribers();
}
