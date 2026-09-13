package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.review.ReviewRequestDTO;
import com.example.moceramicshop.dtos.response.review.ReviewResponseDTO;
import com.example.moceramicshop.exceptions.BadRequestException;
import com.example.moceramicshop.exceptions.ConflictException;
import com.example.moceramicshop.exceptions.ForbiddenException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.ReviewMapper;
import com.example.moceramicshop.models.OrderItem;
import com.example.moceramicshop.models.Product;
import com.example.moceramicshop.models.Review;
import com.example.moceramicshop.models.ReviewImage;
import com.example.moceramicshop.models.User;
import com.example.moceramicshop.repositories.OrderItemRepository;
import com.example.moceramicshop.repositories.ProductRepository;
import com.example.moceramicshop.repositories.ReviewRepository;
import com.example.moceramicshop.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
public class ReviewServiceImp implements ReviewService {

    private static final String STATUS_APPROVED = "approved";

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewMapper reviewMapper;
    private final FileStorageService fileStorageService;

    public ReviewServiceImp(ReviewRepository reviewRepository,
                             ProductRepository productRepository,
                             UserRepository userRepository,
                             OrderItemRepository orderItemRepository,
                             ReviewMapper reviewMapper,
                             FileStorageService fileStorageService) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderItemRepository = orderItemRepository;
        this.reviewMapper = reviewMapper;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public List<ReviewResponseDTO> getAll() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(reviewMapper::toResponseDTO)
                .toList();
    }

    @Override
    public List<ReviewResponseDTO> getAllByProductId(Long productId) {
        return reviewRepository.findByProduct_IdOrderByCreatedAtDesc(productId).stream()
                .map(reviewMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public ReviewResponseDTO create(Long productId, Long customerId, ReviewRequestDTO request, List<MultipartFile> files) {
        User user = userRepository.getUserById(customerId);
        if (user == null) throw new ResourceNotFoundException("Không tìm thấy user với id " + customerId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id " + productId));

        OrderItem orderItem = resolveOrderItem(request.getOrderItemId(), customerId, productId);

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setOrderItem(orderItem);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setStatus(STATUS_APPROVED);
        review.setCreatedAt(Instant.now());
        review.setUpdatedAt(Instant.now());

        attachImages(review, files);

        Review saved = reviewRepository.saveAndFlush(review);
        log.info("Created review id={} for productId={} by customerId={} rating={}", saved.getId(), productId, customerId, request.getRating());
        return reviewMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public ReviewResponseDTO update(Long customerId, Long reviewId, ReviewRequestDTO request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với id " + reviewId));
        if (!review.getUser().getId().equals(customerId)) {
            log.warn("User {} attempted to update review {} owned by user {}", customerId, reviewId, review.getUser().getId());
            throw new ForbiddenException("Bạn không có quyền sửa đánh giá này");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setUpdatedAt(Instant.now());

        log.info("Updated review id={} by customerId={}", reviewId, customerId);
        return reviewMapper.toResponseDTO(reviewRepository.saveAndFlush(review));
    }

    @Override
    @Transactional
    public void delete(Long customerId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với id " + reviewId));
        if (!review.getUser().getId().equals(customerId)) {
            log.warn("User {} attempted to delete review {} owned by user {}", customerId, reviewId, review.getUser().getId());
            throw new ForbiddenException("Bạn không có quyền xóa đánh giá này");
        }

        for (ReviewImage image : review.getImages()) {
            fileStorageService.delete(image.getImageUrl());
        }

        reviewRepository.delete(review);
        log.info("Deleted review id={} by customerId={}", reviewId, customerId);
    }

    private OrderItem resolveOrderItem(Long orderItemId, Long customerId, Long productId) {
        if (orderItemId == null) {
            return null;
        }
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id " + orderItemId));
        if (!orderItem.getOrder().getUser().getId().equals(customerId)) {
            throw new ForbiddenException("Đơn hàng này không thuộc về bạn");
        }
        if (!orderItem.getVariant().getProduct().getId().equals(productId)) {
            throw new BadRequestException("Đơn hàng này không phải của sản phẩm đang đánh giá");
        }
        if (reviewRepository.existsByOrderItem_Id(orderItemId)) {
            throw new ConflictException("Bạn đã đánh giá cho lần mua này rồi");
        }
        return orderItem;
    }

    private void attachImages(Review review, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return;
        }
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            String imageUrl = fileStorageService.store(file);
            ReviewImage image = new ReviewImage();
            image.setReview(review);
            image.setImageUrl(imageUrl);
            review.getImages().add(image);
        }
    }
}
