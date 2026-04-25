package com.cart.controller;

import com.cart.dto.ApiResponse;
import com.cart.dto.CartSummaryResponse;
import com.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final CartService cartService;

    /**
     * GET /api/admin/carts
     * Admin: Get all customer carts
     */
    @GetMapping("/carts")
    public ResponseEntity<ApiResponse<List<CartSummaryResponse>>> getAllCarts() {
        List<CartSummaryResponse> carts = cartService.getAllCarts();
        return ResponseEntity.ok(ApiResponse.success(
                "All carts fetched successfully. Total customers: " + carts.size(), carts));
    }
}
