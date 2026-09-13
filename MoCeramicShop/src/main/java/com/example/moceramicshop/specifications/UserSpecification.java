package com.example.moceramicshop.specifications;

import com.example.moceramicshop.models.User;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    private UserSpecification() {
    }

    public static Specification<User> hasNameEmailOrPhoneContaining(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase() + "%";
            Predicate byName = cb.like(cb.lower(root.get("fullName")), pattern);
            Predicate byEmail = cb.like(cb.lower(root.get("email")), pattern);
            Predicate byPhone = cb.like(cb.lower(root.get("phone")), pattern);
            return cb.or(byName, byEmail, byPhone);
        };
    }

    public static Specification<User> hasRoleId(Integer roleId) {
        return (root, query, cb) -> {
            if (roleId == null) {
                return null;
            }
            return cb.equal(root.get("role").get("id"), roleId);
        };
    }

    public static Specification<User> hasIsActive(Boolean isActive) {
        return (root, query, cb) -> {
            if (isActive == null) {
                return null;
            }
            return cb.equal(root.get("isActive"), isActive);
        };
    }
}
