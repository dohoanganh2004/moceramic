package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, Long> {
    boolean existsByTokenJti(String tokenJti);
}
