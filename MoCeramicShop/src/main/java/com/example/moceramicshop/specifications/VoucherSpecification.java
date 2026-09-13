package com.example.moceramicshop.specifications;

import com.example.moceramicshop.models.Voucher;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class VoucherSpecification {

    private VoucherSpecification() {
    }

    public static Specification<Voucher> hasCodeOrDescriptionContaining(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase() + "%";
            Predicate byCode = cb.like(cb.lower(root.get("code")), pattern);
            Predicate byDescription = cb.like(cb.lower(root.get("description")), pattern);
            return cb.or(byCode, byDescription);
        };
    }

    public static Specification<Voucher> hasDiscountType(String discountType) {
        return (root, query, cb) -> {
            if (discountType == null || discountType.isBlank()) {
                return null;
            }
            return cb.equal(root.get("discountType"), discountType);
        };
    }

    public static Specification<Voucher> hasIsActive(Boolean isActive) {
        return (root, query, cb) -> {
            if (isActive == null) {
                return null;
            }
            return cb.equal(root.get("isActive"), isActive);
        };
    }
}
