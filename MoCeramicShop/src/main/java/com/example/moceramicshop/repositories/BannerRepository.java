package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    @Query("""
            SELECT b FROM Banner b
            WHERE b.isActive = true
              AND (b.startDate IS NULL OR b.startDate <= :now)
              AND (b.endDate IS NULL OR b.endDate >= :now)
            ORDER BY b.sortOrder ASC
            """)
    List<Banner> findActiveBanners(@Param("now") Instant now);
}
