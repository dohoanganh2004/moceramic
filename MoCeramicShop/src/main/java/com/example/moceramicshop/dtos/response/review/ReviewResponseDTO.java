package com.example.moceramicshop.dtos.response.review;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private Long id;
    private Long productId;
    private String productName;
    private Long userId;
    private String userName;
    private String userAvatarUrl;
    private Boolean verifiedPurchase;
    private Byte rating;
    private String comment;
    private String status;
    private List<String> imageUrls;
    private Instant createdAt;
}
