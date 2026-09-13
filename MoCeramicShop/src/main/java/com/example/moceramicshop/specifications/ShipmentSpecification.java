package com.example.moceramicshop.specifications;

import com.example.moceramicshop.models.Shipment;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class ShipmentSpecification {

    private ShipmentSpecification() {
    }

    public static Specification<Shipment> hasTrackingCodeOrOrderCodeContaining(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase() + "%";
            Join<Object, Object> order = root.join("order", JoinType.LEFT);
            Predicate byTracking = cb.like(cb.lower(root.get("trackingCode")), pattern);
            Predicate byOrderCode = cb.like(cb.lower(order.get("orderCode")), pattern);
            return cb.or(byTracking, byOrderCode);
        };
    }

    public static Specification<Shipment> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) {
                return null;
            }
            return cb.equal(root.get("status"), status);
        };
    }
}
