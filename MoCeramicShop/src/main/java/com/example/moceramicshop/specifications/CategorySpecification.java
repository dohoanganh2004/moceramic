package com.example.moceramicshop.specifications;

import com.example.moceramicshop.models.Category;
import org.springframework.data.jpa.domain.Specification;

public class CategorySpecification {

    private CategorySpecification() {
    }

    public static Specification<Category> hasNameContaining(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            return cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%");
        };
    }

    public static Specification<Category> hasParentId(Long parentId) {
        return (root, query, cb) -> {
            if (parentId == null) {
                return null;
            }
            return cb.equal(root.get("parent").get("id"), parentId);
        };
    }
}
