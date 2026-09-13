package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.review.ReviewRequestDTO;
import com.example.moceramicshop.dtos.response.review.ReviewResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.services.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/api/reviews")
    public ResponseEntity<List<ReviewResponseDTO>> getAll() {
        return ResponseEntity.ok(reviewService.getAll());
    }

    @GetMapping("/api/products/{productId}/reviews")
    public ResponseEntity<List<ReviewResponseDTO>> getAllByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getAllByProductId(productId));
    }

    @PostMapping(value = "/api/products/{productId}/reviews", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReviewResponseDTO> create(@PathVariable Long productId,
                                                      @RequestPart("data") @Valid ReviewRequestDTO dto,
                                                      @RequestPart(value = "files", required = false) List<MultipartFile> files,
                                                      @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.create(productId, currentUser.getUser().getId(), dto, files));
    }

    @PutMapping("/api/reviews/{reviewId}")
    public ResponseEntity<ReviewResponseDTO> update(@PathVariable Long reviewId,
                                                      @Valid @RequestBody ReviewRequestDTO dto,
                                                      @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(reviewService.update(currentUser.getUser().getId(), reviewId, dto));
    }

    @DeleteMapping("/api/reviews/{reviewId}")
    public ResponseEntity<Void> delete(@PathVariable Long reviewId, @AuthenticationPrincipal CustomUserDetails currentUser) {
        reviewService.delete(currentUser.getUser().getId(), reviewId);
        return ResponseEntity.noContent().build();
    }
}
