package com.example.moceramicshop.services;

import com.example.moceramicshop.exceptions.RateLimitExceededException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

// Fixed-window counter in Redis: INCR the key, and on the very first hit in a
// window set it to expire after `window` - after that TTL runs out the whole
// key (and count) disappears on its own, so there's nothing to clean up.
@Slf4j
@Service
public class RateLimitServiceImp implements RateLimitService {

    private static final String KEY_PREFIX = "ratelimit:";

    private final StringRedisTemplate redisTemplate;

    public RateLimitServiceImp(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void checkLimit(String key, int maxAttempts, Duration window) {
        String redisKey = KEY_PREFIX + key;
        Long count = redisTemplate.opsForValue().increment(redisKey);
        if (count != null && count == 1L) {
            redisTemplate.expire(redisKey, window);
        }
        if (count != null && count > maxAttempts) {
            log.warn("Rate limit exceeded for key={} count={} max={}", key, count, maxAttempts);
            throw new RateLimitExceededException("Bạn đã thao tác quá nhiều lần, vui lòng thử lại sau ít phút");
        }
    }
}
