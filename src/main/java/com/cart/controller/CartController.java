package com.cart.controller;

import com.cart.dto.*;
import com.cart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    /**
     * GET /api/cart/{customerId}
     * Fetch all cart items for a customer (Cart Dashboard)
     */
    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> getCart(@PathVariable Long customerId) {
        CartSummaryResponse summary = cartService.getCartByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success("Cart fetched successfully", summary));
    }

    /**
     * POST /api/cart/add
     * Add a product to the cart
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse response = cartService.addToCart(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item added to cart", response));
    }

    /**
     * PUT /api/cart/update/{cartId}
     * Update quantity of a cart item
     */
    @PutMapping("/update/{cartId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCart(
            @PathVariable Long cartId,
            @Valid @RequestBody UpdateCartRequest request) {
        CartResponse response = cartService.updateCart(cartId, request);
        return ResponseEntity.ok(ApiResponse.success("Cart updated successfully", response));
    }

    /**
     * DELETE /api/cart/remove/{cartId}
     * Remove a specific item from the cart
     */
    @DeleteMapping("/remove/{cartId}")
    public ResponseEntity<ApiResponse<Object>> removeFromCart(@PathVariable Long cartId) {
        cartService.removeFromCart(cartId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", null));
    }

    /**
     * DELETE /api/cart/clear/{customerId}
     * Clear all items from a customer's cart
     */
    @DeleteMapping("/clear/{customerId}")
    public ResponseEntity<ApiResponse<Object>> clearCart(@PathVariable Long customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }
}
