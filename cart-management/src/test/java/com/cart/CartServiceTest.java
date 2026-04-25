package com.cart;

import com.cart.dto.AddToCartRequest;
import com.cart.dto.CartResponse;
import com.cart.dto.UpdateCartRequest;
import com.cart.exception.InsufficientStockException;
import com.cart.exception.ResourceNotFoundException;
import com.cart.model.Cart;
import com.cart.model.Product;
import com.cart.repository.CartRepository;
import com.cart.repository.ProductRepository;
import com.cart.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private ProductRepository productRepository;
    @InjectMocks private CartService cartService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        sampleProduct = new Product(1L, "Test Product", new BigDecimal("100.00"), 10, "Desc");
    }

    @Test
    void addToCart_success() {
        AddToCartRequest req = new AddToCartRequest();
        req.setCustomerId(1L);
        req.setProductId(1L);
        req.setQuantity(2);

        Cart savedCart = new Cart(1L, 1L, 1L, 2, new BigDecimal("200.00"), null, null);

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(cartRepository.findByCustomerIdAndProductId(1L, 1L)).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenReturn(savedCart);

        CartResponse response = cartService.addToCart(req);

        assertNotNull(response);
        assertEquals(2, response.getQuantity());
        assertEquals(new BigDecimal("200.00"), response.getTotalPrice());
    }

    @Test
    void addToCart_productNotFound_throwsException() {
        AddToCartRequest req = new AddToCartRequest();
        req.setCustomerId(1L);
        req.setProductId(99L);
        req.setQuantity(1);

        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cartService.addToCart(req));
    }

    @Test
    void addToCart_insufficientStock_throwsException() {
        AddToCartRequest req = new AddToCartRequest();
        req.setCustomerId(1L);
        req.setProductId(1L);
        req.setQuantity(100); // more than stock (10)

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        assertThrows(InsufficientStockException.class, () -> cartService.addToCart(req));
    }

    @Test
    void updateCart_success() {
        Cart existingCart = new Cart(1L, 1L, 1L, 2, new BigDecimal("200.00"), null, null);
        UpdateCartRequest req = new UpdateCartRequest();
        req.setQuantity(5);

        Cart updatedCart = new Cart(1L, 1L, 1L, 5, new BigDecimal("500.00"), null, null);

        when(cartRepository.findById(1L)).thenReturn(Optional.of(existingCart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(cartRepository.save(any(Cart.class))).thenReturn(updatedCart);

        CartResponse response = cartService.updateCart(1L, req);

        assertEquals(5, response.getQuantity());
        assertEquals(new BigDecimal("500.00"), response.getTotalPrice());
    }

    @Test
    void removeFromCart_success() {
        Cart cart = new Cart(1L, 1L, 1L, 2, new BigDecimal("200.00"), null, null);
        when(cartRepository.findById(1L)).thenReturn(Optional.of(cart));
        doNothing().when(cartRepository).delete(cart);

        assertDoesNotThrow(() -> cartService.removeFromCart(1L));
        verify(cartRepository, times(1)).delete(cart);
    }

    @Test
    void removeFromCart_notFound_throwsException() {
        when(cartRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> cartService.removeFromCart(99L));
    }
}
