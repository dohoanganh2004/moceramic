package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.review.ReviewResponseDTO;
import com.example.moceramicshop.models.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.fullName")
    @Mapping(target = "userAvatarUrl", source = "user.avatarUrl")
    @Mapping(target = "verifiedPurchase", expression = "java(review.getOrderItem() != null)")
    @Mapping(target = "imageUrls", expression = "java(review.getImages().stream().map(com.example.moceramicshop.models.ReviewImage::getImageUrl).toList())")
    ReviewResponseDTO toResponseDTO(Review review);
}
