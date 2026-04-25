package com.cart;

import com.cart.model.Product;
import com.cart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            List<Product> products = List.of(
                new Product(null, "Wireless Headphones",  new BigDecimal("1999.99"), 50,  "Premium noise-cancelling wireless headphones"),
                new Product(null, "Mechanical Keyboard",  new BigDecimal("3499.00"), 30,  "RGB mechanical keyboard with blue switches"),
                new Product(null, "USB-C Hub",            new BigDecimal("899.50"),  100, "7-in-1 USB-C hub with HDMI and PD charging"),
                new Product(null, "Laptop Stand",         new BigDecimal("1299.00"), 75,  "Adjustable aluminum laptop stand"),
                new Product(null, "Webcam 1080p",         new BigDecimal("2199.00"), 20,  "Full HD webcam with built-in microphone"),
                new Product(null, "Mouse Pad XL",         new BigDecimal("499.00"),  200, "Extended gaming mouse pad, 90x40cm"),
                new Product(null, "Portable SSD 1TB",     new BigDecimal("5999.00"), 15,  "Ultra-fast portable SSD, USB 3.2"),
                new Product(null, "Smart Watch",          new BigDecimal("8999.00"), 10,  "Fitness & health smart watch with AMOLED display")
            );
            productRepository.saveAll(products);
            System.out.println("✅ Sample products seeded successfully.");
        }
    }
}
