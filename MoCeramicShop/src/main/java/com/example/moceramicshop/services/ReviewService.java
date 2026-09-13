package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.review.ReviewRequestDTO;
import com.example.moceramicshop.dtos.response.review.ReviewResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ReviewService {
    List<ReviewResponseDTO> getAll();

    List<ReviewResponseDTO> getAllByProductId(Long productId);

    ReviewResponseDTO create(Long productId, Long customerId, ReviewRequestDTO request, List<MultipartFile> files);

    ReviewResponseDTO update(Long customerId, Long reviewId, ReviewRequestDTO request);

    void delete(Long customerId, Long reviewId);
}
