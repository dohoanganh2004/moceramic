package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.cart.CartItemRequestDTO;
import com.example.moceramicshop.dtos.request.cart.CartItemUpdateRequestDTO;
import com.example.moceramicshop.dtos.response.cart.CartResponseDTO;
import com.example.moceramicshop.exceptions.ForbiddenException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.CartMapper;
import com.example.moceramicshop.models.Cart;
import com.example.moceramicshop.models.CartItem;
import com.example.moceramicshop.models.ProductVariant;
import com.example.moceramicshop.models.User;
import com.example.moceramicshop.repositories.CartItemRepository;
import com.example.moceramicshop.repositories.CartRepository;
import com.example.moceramicshop.repositories.ProductVariantRepository;
import com.example.moceramicshop.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
public class CartServiceImp implements CartService {

    private static final String STATUS_ACTIVE = "active";

    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartMapper cartMapper;

    public CartServiceImp(CartItemRepository cartItemRepository,
                           CartRepository cartRepository,
                           UserRepository userRepository,
                           ProductVariantRepository productVariantRepository,
                           CartMapper cartMapper) {
        this.cartItemRepository = cartItemRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productVariantRepository = productVariantRepository;
        this.cartMapper = cartMapper;
    }

    @Override
    @Transactional
    public CartResponseDTO findByCustomerId(Long customerId) {
        User user = userRepository.getUserById(customerId);
        if (user == null) throw new ResourceNotFoundException("Không tìm thấy user với id " + customerId);

        Cart cart = getOrCreateActiveCart(user);

        return cartMapper.toResponseDTO(cart);
    }

    @Override
    @Transactional
    public CartResponseDTO addItem(Long customerId, CartItemRequestDTO request) {
        User user = userRepository.getUserById(customerId);
        if (user == null) throw new ResourceNotFoundException("Không tìm thấy user với id " + customerId);

        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể với id " + request.getVariantId()));

        Cart cart = getOrCreateActiveCart(user);

        CartItem item = cartItemRepository.findByCart_IdAndVariant_Id(cart.getId(), variant.getId())
                .orElse(null);

        if (item != null) {
            item.setQuantity(item.getQuantity() + request.getQuantity());
            log.info("Incremented cart item id={} to quantity={} for userId={}", item.getId(), item.getQuantity(), customerId);
        } else {
            item = new CartItem();
            item.setCart(cart);
            item.setVariant(variant);
            item.setQuantity(request.getQuantity());
            item.setPriceAtAdd(variant.getPrice());
            item.setCreatedAt(Instant.now());
            cart.getItems().add(item);
            log.info("Added variantId={} quantity={} to cartId={} for userId={}", variant.getId(), request.getQuantity(), cart.getId(), customerId);
        }

        cart.setUpdatedAt(Instant.now());
        Cart saved = cartRepository.save(cart);

        return cartMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public CartResponseDTO updateItem(Long customerId, Long cartItemId, CartItemUpdateRequestDTO request) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong giỏ với id " + cartItemId));
        if (!item.getCart().getUser().getId().equals(customerId)) {
            log.warn("User {} attempted to update cart item {} owned by user {}", customerId, cartItemId, item.getCart().getUser().getId());
            throw new ForbiddenException("Bạn không có quyền sửa giỏ hàng này");
        }

        item.setQuantity(request.getQuantity());
        Cart cart = item.getCart();
        cart.setUpdatedAt(Instant.now());

        log.info("Updated cart item id={} to quantity={} for userId={}", cartItemId, request.getQuantity(), customerId);
        return cartMapper.toResponseDTO(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public void removeItem(Long customerId, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong giỏ với id " + cartItemId));
        if (!item.getCart().getUser().getId().equals(customerId)) {
            log.warn("User {} attempted to remove cart item {} owned by user {}", customerId, cartItemId, item.getCart().getUser().getId());
            throw new ForbiddenException("Bạn không có quyền xóa khỏi giỏ hàng này");
        }

        Cart cart = item.getCart();
        cart.getItems().remove(item);
        cart.setUpdatedAt(Instant.now());
        cartRepository.save(cart);
        log.info("Removed cart item id={} for userId={}", cartItemId, customerId);
    }

    private Cart getOrCreateActiveCart(User user) {
        return cartRepository.findByUser_IdAndStatus(user.getId(), STATUS_ACTIVE)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setStatus(STATUS_ACTIVE);
                    newCart.setCreatedAt(Instant.now());
                    newCart.setUpdatedAt(Instant.now());
                    return cartRepository.save(newCart);
                });
    }
}
