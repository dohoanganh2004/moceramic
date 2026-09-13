package com.example.moceramicshop.specifications;

import com.example.moceramicshop.models.BlogPost;
import org.springframework.data.jpa.domain.Specification;

public class BlogPostSpecification {

    private BlogPostSpecification() {
    }

    public static Specification<BlogPost> hasTitleContaining(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            return cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%");
        };
    }

    public static Specification<BlogPost> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) {
                return null;
            }
            return cb.equal(root.get("status"), status);
        };
    }
}
