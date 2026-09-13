package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.response.newsletter.NewsletterSubscriberResponseDTO;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.NewsletterSubscriberMapper;
import com.example.moceramicshop.models.NewsletterSubscriber;
import com.example.moceramicshop.repositories.NewsletterSubscriberRepository;
import com.example.moceramicshop.specifications.NewsletterSubscriberSpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
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

        NewsletterSubscriber saved = newsletterSubscriberRepository.saveAndFlush(subscriber);
        log.info("Newsletter subscription upserted for email={}", email);
        return newsletterSubscriberMapper.toResponseDTO(saved);
    }

    @Override
    public List<NewsletterSubscriberResponseDTO> getAllSubscribers() {
        return newsletterSubscriberRepository.findAll().stream()
                .map(newsletterSubscriberMapper::toResponseDTO)
                .toList();
    }

    @Override
    public Page<NewsletterSubscriberResponseDTO> search(String search, Boolean isActive, Pageable pageable) {
        Specification<NewsletterSubscriber> spec = Specification
                .where(NewsletterSubscriberSpecification.hasEmailContaining(search))
                .and(NewsletterSubscriberSpecification.hasIsActive(isActive));
        log.info("Searching newsletter subscribers: search={} isActive={} page={}", search, isActive, pageable);
        return newsletterSubscriberRepository.findAll(spec, pageable).map(newsletterSubscriberMapper::toResponseDTO);
    }

    @Override
    public void delete(Long id) {
        if (!newsletterSubscriberRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy người đăng ký với id " + id);
        }
        newsletterSubscriberRepository.deleteById(id);
        log.info("Deleted newsletter subscriber id={}", id);
    }
}
