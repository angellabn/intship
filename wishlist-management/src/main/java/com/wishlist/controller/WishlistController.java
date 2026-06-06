package com.wishlist.controller;

import com.wishlist.dto.*;
import com.wishlist.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WishlistController {

    private final WishlistService wishlistService;

    /**
     * GET /api/wishlist/{customerId}
     * View all wishlist items for a customer
     */
    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getWishlist(
            @PathVariable Long customerId) {
        List<WishlistResponse> items = wishlistService.getWishlistByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success(
                "Wishlist fetched successfully. Total items: " + items.size(), items));
    }

    /**
     * POST /api/wishlist/add
     * Add a product to the wishlist
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(
            @Valid @RequestBody AddToWishlistRequest request) {
        WishlistResponse response = wishlistService.addToWishlist(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product added to wishlist", response));
    }

    /**
     * DELETE /api/wishlist/remove/{wishlistId}
     * Remove a specific item from the wishlist
     */
    @DeleteMapping("/remove/{wishlistId}")
    public ResponseEntity<ApiResponse<Object>> removeFromWishlist(
            @PathVariable Long wishlistId) {
        wishlistService.removeFromWishlist(wishlistId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from wishlist", null));
    }

    /**
     * POST /api/wishlist/move-to-cart/{wishlistId}
     * Move a wishlist item to the cart
     */
    @PostMapping("/move-to-cart/{wishlistId}")
    public ResponseEntity<ApiResponse<Object>> moveToCart(
            @PathVariable Long wishlistId,
            @Valid @RequestBody MoveToCartRequest request) {
        ApiResponse<Object> response = wishlistService.moveToCart(wishlistId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/wishlist/clear/{customerId}
     * Clear entire wishlist for a customer
     */
    @DeleteMapping("/clear/{customerId}")
    public ResponseEntity<ApiResponse<Object>> clearWishlist(
            @PathVariable Long customerId) {
        wishlistService.clearWishlist(customerId);
        return ResponseEntity.ok(ApiResponse.success("Wishlist cleared successfully", null));
    }

    /**
     * GET /api/wishlist/check/{customerId}/{productId}
     * Check if a product is already in the wishlist
     */
    @GetMapping("/check/{customerId}/{productId}")
    public ResponseEntity<ApiResponse<Boolean>> checkWishlist(
            @PathVariable Long customerId,
            @PathVariable Long productId) {
        boolean exists = wishlistService.isInWishlist(customerId, productId);
        return ResponseEntity.ok(ApiResponse.success(
                exists ? "Product is in wishlist" : "Product is not in wishlist", exists));
    }
}
