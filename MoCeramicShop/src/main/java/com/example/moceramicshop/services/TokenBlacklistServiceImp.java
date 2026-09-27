package com.example.moceramicshop.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.TimeUnit;

// Replaces the old MySQL blacklisted_tokens table: a revoked token's jti is
// stored with a TTL equal to its own remaining lifetime, so Redis expires
// (and forgets) it automatically at the same moment the JWT itself would
// have stopped being valid anyway - no cleanup job needed.
@Slf4j
@Service
public class TokenBlacklistServiceImp implements TokenBlacklistService {

    private static final String KEY_PREFIX = "blacklist:token:";

    private final StringRedisTemplate redisTemplate;

    public TokenBlacklistServiceImp(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void blacklist(String jti, Instant expiresAt) {
        long ttlSeconds = Math.max(1, Duration.between(Instant.now(), expiresAt).getSeconds());
        redisTemplate.opsForValue().set(KEY_PREFIX + jti, "1", ttlSeconds, TimeUnit.SECONDS);
        log.info("Blacklisted token jti={} for {}s", jti, ttlSeconds);
    }

    @Override
    public boolean isBlacklisted(String jti) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(KEY_PREFIX + jti));
    }
}
