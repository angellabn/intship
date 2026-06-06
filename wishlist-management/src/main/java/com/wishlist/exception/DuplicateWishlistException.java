package com.wishlist.exception;

public class DuplicateWishlistException extends RuntimeException {
    public DuplicateWishlistException(String message) {
        super(message);
    }
}
