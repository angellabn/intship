package com.wishlist.service;

import com.wishlist.dto.*;
import com.wishlist.exception.DuplicateWishlistException;
import com.wishlist.exception.ResourceNotFoundException;
import com.wishlist.model.Product;
import com.wishlist.model.Wishlist;
import com.wishlist.repository.ProductRepository;
import com.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    // ── 1. Add to Wishlist ───────────────────────────────────────────────────
    @Transactional
    public WishlistResponse addToWishlist(AddToWishlistRequest request) {
        // Validate product exists
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with ID: " + request.getProductId()));

        // Check for duplicate
        if (wishlistRepository.existsByCustomerIdAndProductId(
                request.getCustomerId(), request.getProductId())) {
            throw new DuplicateWishlistException(
                    "Product is already in the wishlist.");
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setCustomerId(request.getCustomerId());
        wishlist.setProductId(request.getProductId());

        wishlist = wishlistRepository.save(wishlist);
        return toResponse(wishlist, product);
    }

    // ── 2. View Wishlist ─────────────────────────────────────────────────────
    public List<WishlistResponse> getWishlistByCustomer(Long customerId) {
        List<Wishlist> items = wishlistRepository.findByCustomerId(customerId);
        return items.stream()
                .map(w -> {
                    Product product = productRepository.findById(w.getProductId()).orElse(null);
                    return toResponse(w, product);
                })
                .collect(Collectors.toList());
    }

    // ── 3. Remove from Wishlist ──────────────────────────────────────────────
    @Transactional
    public void removeFromWishlist(Long wishlistId) {
        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Wishlist item not found with ID: " + wishlistId));
        wishlistRepository.delete(wishlist);
    }

    // ── 4. Move from Wishlist to Cart ────────────────────────────────────────
    @Transactional
    public ApiResponse<Object> moveToCart(Long wishlistId, MoveToCartRequest request) {
        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Wishlist item not found with ID: " + wishlistId));

        Long productId = wishlist.getProductId();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with ID: " + productId));

        if (product.getStock() < request.getQuantity()) {
            return ApiResponse.error(
                    "Insufficient stock. Available: " + product.getStock());
        }

        // Remove from wishlist after moving
        wishlistRepository.delete(wishlist);

        return ApiResponse.success(
                "Product '" + product.getName() + "' moved to cart successfully. " +
                "Quantity: " + request.getQuantity(), null);
    }

    // ── Clear entire wishlist ────────────────────────────────────────────────
    @Transactional
    public void clearWishlist(Long customerId) {
        wishlistRepository.deleteByCustomerId(customerId);
    }

    // ── Check if product is in wishlist ──────────────────────────────────────
    public boolean isInWishlist(Long customerId, Long productId) {
        return wishlistRepository.existsByCustomerIdAndProductId(customerId, productId);
    }

    // ── Helper ───────────────────────────────────────────────────────────────
    private WishlistResponse toResponse(Wishlist w, Product product) {
        WishlistResponse r = new WishlistResponse();
        r.setWishlistId(w.getWishlistId());
        r.setCustomerId(w.getCustomerId());
        r.setProductId(w.getProductId());
        r.setProductName(product != null ? product.getName() : "Unknown Product");
        r.setPrice(product != null ? product.getPrice() : null);
        r.setAvailability(product != null
                ? (product.getStock() > 0 ? "In Stock" : "Out of Stock")
                : "Unknown");
        r.setCreatedAt(w.getCreatedAt());
        r.setUpdatedAt(w.getUpdatedAt());
        return r;
    }
}
