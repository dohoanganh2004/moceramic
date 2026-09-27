package com.example.moceramicshop.services;

import java.time.Duration;

public interface RateLimitService {
    /**
     * Increments the counter for {@code key} and throws
     * {@link com.example.moceramicshop.exceptions.RateLimitExceededException}
     * once it exceeds {@code maxAttempts} within the rolling {@code window}.
     */
    void checkLimit(String key, int maxAttempts, Duration window);
}
