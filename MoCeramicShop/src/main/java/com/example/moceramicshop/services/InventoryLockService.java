package com.example.moceramicshop.services;

import java.util.function.Supplier;

public interface InventoryLockService {
    /**
     * Runs {@code action} while holding an exclusive lock for the given
     * variant, so concurrent reservation attempts for the same variant are
     * serialized instead of racing each other.
     */
    <T> T withLock(Long variantId, Supplier<T> action);
}
