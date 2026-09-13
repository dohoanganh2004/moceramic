package com.example.moceramicshop.specifications;

import com.example.moceramicshop.models.Order;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class OrderSpecification {

    private OrderSpecification() {
    }

    public static Specification<Order> hasOrderCodeOrCustomerNameContaining(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase() + "%";
            Join<Object, Object> user = root.join("user", JoinType.LEFT);
            Predicate byOrderCode = cb.like(cb.lower(root.get("orderCode")), pattern);
            Predicate byCustomerName = cb.like(cb.lower(user.get("fullName")), pattern);
            return cb.or(byOrderCode, byCustomerName);
        };
    }

    public static Specification<Order> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) {
                return null;
            }
            return cb.equal(root.get("status"), status);
        };
    }
}
