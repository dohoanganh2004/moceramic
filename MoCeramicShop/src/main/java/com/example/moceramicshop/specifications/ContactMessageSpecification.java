package com.example.moceramicshop.specifications;

import com.example.moceramicshop.models.ContactMessage;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class ContactMessageSpecification {

    private ContactMessageSpecification() {
    }

    public static Specification<ContactMessage> hasNameEmailOrSubjectContaining(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase() + "%";
            Predicate byName = cb.like(cb.lower(root.get("name")), pattern);
            Predicate byEmail = cb.like(cb.lower(root.get("email")), pattern);
            Predicate bySubject = cb.like(cb.lower(root.get("subject")), pattern);
            return cb.or(byName, byEmail, bySubject);
        };
    }

    public static Specification<ContactMessage> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) {
                return null;
            }
            return cb.equal(root.get("status"), status);
        };
    }
}
