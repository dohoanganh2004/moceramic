package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.wishlist.WishlistRequestDTO;
import com.example.moceramicshop.dtos.response.wishlist.WishlistResponseDTO;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.WishlistMapper;
import com.example.moceramicshop.models.Product;
import com.example.moceramicshop.models.User;
import com.example.moceramicshop.models.Wishlist;
import com.example.moceramicshop.repositories.ProductRepository;
import com.example.moceramicshop.repositories.UserRepository;
import com.example.moceramicshop.repositories.WishlistRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
public class WishlistServiceImp implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final WishlistMapper wishlistMapper;

    public WishlistServiceImp(WishlistRepository wishlistRepository,
                               UserRepository userRepository,
                               ProductRepository productRepository,
                               WishlistMapper wishlistMapper) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.wishlistMapper = wishlistMapper;
    }

    @Override
    public List<WishlistResponseDTO> getMyWishlist(Long customerId) {
        return wishlistRepository.findByUser_IdOrderByCreatedAtDesc(customerId).stream()
                .map(wishlistMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public WishlistResponseDTO addToWishlist(Long customerId, WishlistRequestDTO request) {
        Wishlist existing = wishlistRepository.findByUser_IdAndProduct_Id(customerId, request.getProductId())
                .orElse(null);
        if (existing != null) {
            return wishlistMapper.toResponseDTO(existing);
        }

        User user = userRepository.getUserById(customerId);
        if (user == null) throw new ResourceNotFoundException("Không tìm thấy user với id " + customerId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id " + request.getProductId()));

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        wishlist.setCreatedAt(Instant.now());

        Wishlist saved = wishlistRepository.saveAndFlush(wishlist);
        log.info("Added productId={} to wishlist for customerId={}", request.getProductId(), customerId);
        return wishlistMapper.toResponseDTO(saved);
    }

    @Override
    public void removeFromWishlist(Long customerId, Long productId) {
        Wishlist wishlist = wishlistRepository.findByUser_IdAndProduct_Id(customerId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm này không có trong danh sách yêu thích"));
        wishlistRepository.delete(wishlist);
        log.info("Removed productId={} from wishlist for customerId={}", productId, customerId);
    }
}
