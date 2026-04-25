package com.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartSummaryResponse {
    private Long customerId;
    private List<CartResponse> items;
    private int totalItems;
    private BigDecimal grandTotal;
}
