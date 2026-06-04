package com.cart.repository;

import com.cart.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    List<Cart> findByCustomerId(Long customerId);

    Optional<Cart> findByCustomerIdAndProductId(Long customerId, Long productId);

    void deleteByCustomerId(Long customerId);

    @Query("SELECT COUNT(DISTINCT c.customerId) FROM Cart c")
    long countDistinctCustomers();

    boolean existsByCustomerId(Long customerId);
}
