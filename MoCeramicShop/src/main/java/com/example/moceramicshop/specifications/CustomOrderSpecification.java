package com.example.moceramicshop.specifications;

import com.example.moceramicshop.models.CustomOrder;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class CustomOrderSpecification {

    private CustomOrderSpecification() {
    }

    public static Specification<CustomOrder> hasContactInfoOrDescriptionContaining(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase() + "%";
            Predicate byName = cb.like(cb.lower(root.get("contactName")), pattern);
            Predicate byEmail = cb.like(cb.lower(root.get("contactEmail")), pattern);
            Predicate byDescription = cb.like(cb.lower(root.get("description").as(String.class)), pattern);
            return cb.or(byName, byEmail, byDescription);
        };
    }

    public static Specification<CustomOrder> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) {
                return null;
            }
            return cb.equal(root.get("status"), status);
        };
    }
}
