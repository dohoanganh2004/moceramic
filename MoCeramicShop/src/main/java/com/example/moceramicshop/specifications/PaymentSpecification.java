package com.example.moceramicshop.specifications;

import com.example.moceramicshop.models.Payment;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class PaymentSpecification {

    private PaymentSpecification() {
    }

    public static Specification<Payment> hasOrderCodeOrTransactionRefContaining(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase() + "%";
            Join<Object, Object> order = root.join("order", JoinType.LEFT);
            Predicate byOrderCode = cb.like(cb.lower(order.get("orderCode")), pattern);
            Predicate byTransactionRef = cb.like(cb.lower(root.get("transactionRef")), pattern);
            return cb.or(byOrderCode, byTransactionRef);
        };
    }

    public static Specification<Payment> hasMethod(String method) {
        return (root, query, cb) -> {
            if (method == null || method.isBlank()) {
                return null;
            }
            return cb.equal(root.get("method"), method);
        };
    }

    public static Specification<Payment> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) {
                return null;
            }
            return cb.equal(root.get("status"), status);
        };
    }
}
