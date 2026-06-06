package com.wishlist.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponse {
    private Long wishlistId;
    private Long customerId;
    private Long productId;
    private String productName;
    private BigDecimal price;
    private String availability;  // "In Stock" / "Out of Stock"
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
