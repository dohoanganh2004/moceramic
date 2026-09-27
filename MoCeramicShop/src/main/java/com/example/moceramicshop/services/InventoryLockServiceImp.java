package com.example.moceramicshop.services;

import com.example.moceramicshop.exceptions.ConflictException;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Slf4j
@Service
public class InventoryLockServiceImp implements InventoryLockService {

    private static final String LOCK_KEY_PREFIX = "lock:inventory:";
    // How long a caller waits to acquire the lock before giving up.
    private static final long WAIT_SECONDS = 5;
    // Safety net: auto-releases the lock after this long even if the holder
    // never reaches the finally block (e.g. the JVM crashes mid-request), so a
    // stuck lock can't permanently block a variant.
    private static final long LEASE_SECONDS = 5;

    private final RedissonClient redissonClient;

    public InventoryLockServiceImp(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    @Override
    public <T> T withLock(Long variantId, Supplier<T> action) {
        RLock lock = redissonClient.getLock(LOCK_KEY_PREFIX + variantId);
        boolean acquired;
        try {
            acquired = lock.tryLock(WAIT_SECONDS, LEASE_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while waiting for the inventory lock", e);
        }
        if (!acquired) {
            log.warn("Could not acquire inventory lock for variantId={} within {}s", variantId, WAIT_SECONDS);
            throw new ConflictException("Sản phẩm này đang được nhiều người đặt mua cùng lúc, vui lòng thử lại sau giây lát");
        }
        try {
            return action.get();
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
