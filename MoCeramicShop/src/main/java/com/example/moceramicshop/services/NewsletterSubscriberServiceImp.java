package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.response.newsletter.NewsletterSubscriberResponseDTO;
import com.example.moceramicshop.mappers.NewsletterSubscriberMapper;
import com.example.moceramicshop.models.NewsletterSubscriber;
import com.example.moceramicshop.repositories.NewsletterSubscriberRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class NewsletterSubscriberServiceImp implements NewsletterSubscriberService {

    private final NewsletterSubscriberRepository newsletterSubscriberRepository;
    private final NewsletterSubscriberMapper newsletterSubscriberMapper;

    public NewsletterSubscriberServiceImp(NewsletterSubscriberRepository newsletterSubscriberRepository,
                                           NewsletterSubscriberMapper newsletterSubscriberMapper) {
        this.newsletterSubscriberRepository = newsletterSubscriberRepository;
        this.newsletterSubscriberMapper = newsletterSubscriberMapper;
    }

    @Override
    public NewsletterSubscriberResponseDTO subscribe(String email) {
        NewsletterSubscriber subscriber = newsletterSubscriberRepository.findByEmail(email).orElse(null);

        if (subscriber == null) {
            subscriber = new NewsletterSubscriber();
            subscriber.setEmail(email);
            subscriber.setSubscribedAt(Instant.now());
            subscriber.setIsActive(true);
        } else if (!Boolean.TRUE.equals(subscriber.getIsActive())) {
            subscriber.setIsActive(true);
            subscriber.setSubscribedAt(Instant.now());
        }

        return newsletterSubscriberMapper.toResponseDTO(newsletterSubscriberRepository.saveAndFlush(subscriber));
    }

    @Override
    public List<NewsletterSubscriberResponseDTO> getAllSubscribers() {
        return newsletterSubscriberRepository.findAll().stream()
                .map(newsletterSubscriberMapper::toResponseDTO)
                .toList();
    }
}
