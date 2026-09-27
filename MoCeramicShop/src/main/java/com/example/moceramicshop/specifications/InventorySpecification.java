package com.example.moceramicshop.specifications;

import com.example.moceramicshop.models.Inventory;
import com.example.moceramicshop.models.Product;
import com.example.moceramicshop.models.ProductVariant;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class InventorySpecification {

    private InventorySpecification() {
    }

    public static Specification<Inventory> hasProductOrSkuContaining(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            Join<Inventory, ProductVariant> variant = root.join("variant");
            Join<ProductVariant, Product> product = variant.join("product");
            String pattern = "%" + search.toLowerCase() + "%";
            Predicate byProductName = cb.like(cb.lower(product.get("name")), pattern);
            Predicate bySku = cb.like(cb.lower(variant.get("sku")), pattern);
            return cb.or(byProductName, bySku);
        };
    }

    // "Available" stock (on hand minus already-reserved-for-open-orders) at or
    // below the threshold - what an admin actually needs to restock, since raw
    // on-hand alone can look fine while everything is already spoken for.
    public static Specification<Inventory> hasAvailableAtMost(Integer threshold) {
        return (root, query, cb) -> {
            if (threshold == null) {
                return null;
            }
            return cb.lessThanOrEqualTo(
                    cb.diff(root.get("quantityOnHand"), root.get("quantityReserved")),
                    threshold
            );
        };
    }
}
