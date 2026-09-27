package com.example.moceramicshop.services;

import java.time.Instant;

public interface TokenBlacklistService {
    void blacklist(String jti, Instant expiresAt);
    boolean isBlacklisted(String jti);
}
