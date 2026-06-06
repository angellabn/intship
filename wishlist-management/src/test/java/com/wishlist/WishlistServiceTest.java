package com.wishlist;

import com.wishlist.dto.AddToWishlistRequest;
import com.wishlist.dto.MoveToCartRequest;
import com.wishlist.dto.WishlistResponse;
import com.wishlist.exception.DuplicateWishlistException;
import com.wishlist.exception.ResourceNotFoundException;
import com.wishlist.model.Product;
import com.wishlist.model.Wishlist;
import com.wishlist.repository.ProductRepository;
import com.wishlist.repository.WishlistRepository;
import com.wishlist.service.WishlistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class WishlistServiceTest {

    @Mock private WishlistRepository wishlistRepository;
    @Mock private ProductRepository productRepository;
    @InjectMocks private WishlistService wishlistService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        sampleProduct = new Product(1L, "Test Product", new BigDecimal("500.00"), 10, "Desc");
    }

    @Test
    void addToWishlist_success() {
        AddToWishlistRequest req = new AddToWishlistRequest();
        req.setCustomerId(1L);
        req.setProductId(1L);

        Wishlist saved = new Wishlist(1L, 1L, 1L, null, null);

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(wishlistRepository.existsByCustomerIdAndProductId(1L, 1L)).thenReturn(false);
        when(wishlistRepository.save(any(Wishlist.class))).thenReturn(saved);

        WishlistResponse response = wishlistService.addToWishlist(req);

        assertNotNull(response);
        assertEquals("Test Product", response.getProductName());
        assertEquals("In Stock", response.getAvailability());
    }

    @Test
    void addToWishlist_productNotFound_throwsException() {
        AddToWishlistRequest req = new AddToWishlistRequest();
        req.setCustomerId(1L);
        req.setProductId(99L);

        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> wishlistService.addToWishlist(req));
    }

    @Test
    void addToWishlist_duplicate_throwsException() {
        AddToWishlistRequest req = new AddToWishlistRequest();
        req.setCustomerId(1L);
        req.setProductId(1L);

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(wishlistRepository.existsByCustomerIdAndProductId(1L, 1L)).thenReturn(true);

        assertThrows(DuplicateWishlistException.class, () -> wishlistService.addToWishlist(req));
    }

    @Test
    void removeFromWishlist_success() {
        Wishlist w = new Wishlist(1L, 1L, 1L, null, null);
        when(wishlistRepository.findById(1L)).thenReturn(Optional.of(w));
        doNothing().when(wishlistRepository).delete(w);

        assertDoesNotThrow(() -> wishlistService.removeFromWishlist(1L));
        verify(wishlistRepository, times(1)).delete(w);
    }

    @Test
    void removeFromWishlist_notFound_throwsException() {
        when(wishlistRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> wishlistService.removeFromWishlist(99L));
    }

    @Test
    void getWishlist_returnsItems() {
        Wishlist w = new Wishlist(1L, 1L, 1L, null, null);
        when(wishlistRepository.findByCustomerId(1L)).thenReturn(List.of(w));
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        var result = wishlistService.getWishlistByCustomer(1L);

        assertEquals(1, result.size());
        assertEquals("Test Product", result.get(0).getProductName());
    }

    @Test
    void moveToCart_outOfStock_returnsError() {
        sampleProduct.setStock(0);
        Wishlist w = new Wishlist(1L, 1L, 1L, null, null);
        MoveToCartRequest req = new MoveToCartRequest();
        req.setQuantity(1);

        when(wishlistRepository.findById(1L)).thenReturn(Optional.of(w));
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        var response = wishlistService.moveToCart(1L, req);
        assertEquals("error", response.getStatus());
    }
}
