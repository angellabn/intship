package com.cart.service;

import com.cart.dto.*;
import com.cart.exception.InsufficientStockException;
import com.cart.exception.ResourceNotFoundException;
import com.cart.model.Cart;
import com.cart.model.Product;
import com.cart.repository.CartRepository;
import com.cart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    // ── Add to Cart ─────────────────────────────────────────────────────────
    @Transactional
    public CartResponse addToCart(AddToCartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with ID: " + request.getProductId()));

        if (product.getStock() < request.getQuantity()) {
            throw new InsufficientStockException(
                    "Insufficient stock. Available: " + product.getStock());
        }

        // If already in cart, increment quantity
        Optional<Cart> existing = cartRepository
                .findByCustomerIdAndProductId(request.getCustomerId(), request.getProductId());

        Cart cart;
        if (existing.isPresent()) {
            cart = existing.get();
            int newQty = cart.getQuantity() + request.getQuantity();
            if (product.getStock() < newQty) {
                throw new InsufficientStockException(
                        "Insufficient stock for total quantity. Available: " + product.getStock());
            }
            cart.setQuantity(newQty);
            cart.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(newQty)));
        } else {
            cart = new Cart();
            cart.setCustomerId(request.getCustomerId());
            cart.setProductId(request.getProductId());
            cart.setQuantity(request.getQuantity());
            cart.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
        }

        cart = cartRepository.save(cart);
        return toResponse(cart, product);
    }

    // ── Update Cart ─────────────────────────────────────────────────────────
    @Transactional
    public CartResponse updateCart(Long cartId, UpdateCartRequest request) {
        final Long id = cartId;
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cart item not found with ID: " + cartId));

        Long productId = cart.getProductId();

Product product = productRepository.findById(productId)
        .orElseThrow(() -> new ResourceNotFoundException(
                "Product not found with ID: " + productId));
        if (product.getStock() < request.getQuantity()) {
            throw new InsufficientStockException(
                    "Insufficient stock. Available: " + product.getStock());
        }

        cart.setQuantity(request.getQuantity());
        cart.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
        cart = cartRepository.save(cart);
        return toResponse(cart, product);
    }

    // ── Remove from Cart ────────────────────────────────────────────────────
    @Transactional
    public void removeFromCart(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cart item not found with ID: " + cartId));
        cartRepository.delete(cart);
    }

    // ── Clear entire cart for a customer ────────────────────────────────────
    @Transactional
    public void clearCart(Long customerId) {
        cartRepository.deleteByCustomerId(customerId);
    }

    // ── Get Cart (Dashboard) ─────────────────────────────────────────────────
    public CartSummaryResponse getCartByCustomer(Long customerId) {
        List<Cart> items = cartRepository.findByCustomerId(customerId);
        if (items.isEmpty()) {
            return new CartSummaryResponse(customerId, List.of(), 0, BigDecimal.ZERO);
        }

        List<CartResponse> responses = items.stream().map(cart -> {
            Product product = productRepository.findById(cart.getProductId())
                    .orElse(null);
            return toResponse(cart, product);
        }).collect(Collectors.toList());

        BigDecimal grandTotal = responses.stream()
                .map(CartResponse::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartSummaryResponse(customerId, responses, responses.size(), grandTotal);
    }

    // ── Admin: All carts ─────────────────────────────────────────────────────
    public List<CartSummaryResponse> getAllCarts() {
        List<Cart> allCarts = cartRepository.findAll();

        return allCarts.stream()
                .collect(Collectors.groupingBy(Cart::getCustomerId))
                .entrySet().stream()
                .map(entry -> {
                    Long customerId = entry.getKey();
                    List<CartResponse> items = entry.getValue().stream().map(cart -> {
                        Product product = productRepository.findById(cart.getProductId()).orElse(null);
                        return toResponse(cart, product);
                    }).collect(Collectors.toList());

                    BigDecimal grandTotal = items.stream()
                            .map(CartResponse::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return new CartSummaryResponse(customerId, items, items.size(), grandTotal);
                })
                .collect(Collectors.toList());
    }

    // ── Helper ───────────────────────────────────────────────────────────────
    private CartResponse toResponse(Cart cart, Product product) {
        CartResponse r = new CartResponse();
        r.setCartId(cart.getCartId());
        r.setCustomerId(cart.getCustomerId());
        r.setProductId(cart.getProductId());
        r.setProductName(product != null ? product.getName() : "Unknown Product");
        r.setUnitPrice(product != null ? product.getPrice() : BigDecimal.ZERO);
        r.setQuantity(cart.getQuantity());
        r.setTotalPrice(cart.getTotalPrice());
        r.setCreatedAt(cart.getCreatedAt());
        r.setUpdatedAt(cart.getUpdatedAt());
        return r;
    }
}
