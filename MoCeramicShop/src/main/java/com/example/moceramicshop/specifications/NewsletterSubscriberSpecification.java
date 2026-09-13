package com.example.moceramicshop.specifications;

import com.example.moceramicshop.models.NewsletterSubscriber;
import org.springframework.data.jpa.domain.Specification;

public class NewsletterSubscriberSpecification {

    private NewsletterSubscriberSpecification() {
    }

    public static Specification<NewsletterSubscriber> hasEmailContaining(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            return cb.like(cb.lower(root.get("email")), "%" + search.toLowerCase() + "%");
        };
    }

    public static Specification<NewsletterSubscriber> hasIsActive(Boolean isActive) {
        return (root, query, cb) -> {
            if (isActive == null) {
                return null;
            }
            return cb.equal(root.get("isActive"), isActive);
        };
    }
}
