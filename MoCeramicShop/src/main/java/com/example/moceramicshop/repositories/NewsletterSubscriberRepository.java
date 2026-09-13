package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, Long>, JpaSpecificationExecutor<NewsletterSubscriber> {
    Optional<NewsletterSubscriber> findByEmail(String email);
}
