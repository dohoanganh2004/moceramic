package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findAllByOrderByCreatedAtDesc();

    List<Review> findByProduct_IdOrderByCreatedAtDesc(Long productId);

    boolean existsByOrderItem_Id(Long orderItemId);
}
