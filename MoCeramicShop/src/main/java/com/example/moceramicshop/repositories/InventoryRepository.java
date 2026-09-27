package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long>, JpaSpecificationExecutor<Inventory> {
    Optional<Inventory> findByVariant_Id(Long variantId);

    // Atomic check-and-reserve: the WHERE clause re-checks availability at the
    // moment of the write, so this can never reserve more than is actually on
    // hand even under concurrent requests for the same variant - unlike the
    // old read-then-write pattern, this needs no application-level lock to be
    // correct (the Redis lock in InventoryLockService is an extra layer on
    // top, mainly so a losing request fails fast with a clean error instead of
    // piling up on the DB row).
    @Modifying
    @Query("UPDATE Inventory i SET i.quantityReserved = i.quantityReserved + :qty, i.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE i.variant.id = :variantId AND (i.quantityOnHand - i.quantityReserved) >= :qty")
    int reserveStock(@Param("variantId") Long variantId, @Param("qty") int qty);

    // Inverse of reserveStock - used when releasing a reservation (order
    // cancelled) or when a completed order actually consumes the stock. Floors
    // at 0 defensively so a double-release can't drive reserved negative.
    @Modifying
    @Query("UPDATE Inventory i SET i.quantityReserved = CASE WHEN i.quantityReserved - :qty < 0 THEN 0 ELSE i.quantityReserved - :qty END, " +
            "i.updatedAt = CURRENT_TIMESTAMP WHERE i.variant.id = :variantId")
    int releaseStock(@Param("variantId") Long variantId, @Param("qty") int qty);
}
