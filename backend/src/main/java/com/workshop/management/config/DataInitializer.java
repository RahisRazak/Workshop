package com.workshop.management.config;

import com.workshop.management.entity.*;
import com.workshop.management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    @Bean
    @Profile("!test")
    public CommandLineRunner initData(UserRepository userRepository,
            ServiceItemRepository serviceItemRepository) {
        return args -> {
            // Create default admin user if not exists
            if (!userRepository.existsByUsername("admin")) {
                User admin = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .fullName("System Administrator")
                        .email("admin@workshop.com")
                        .phone("555-0100")
                        .role(Role.ADMIN)
                        .enabled(true)
                        .build();
                userRepository.save(admin);
            }

            // Create default mechanic user if not exists
            if (!userRepository.existsByUsername("mechanic")) {
                User mechanic = User.builder()
                        .username("mechanic")
                        .password(passwordEncoder.encode("mechanic123"))
                        .fullName("John Mechanic")
                        .email("mechanic@workshop.com")
                        .phone("555-0101")
                        .role(Role.MECHANIC)
                        .enabled(true)
                        .build();
                userRepository.save(mechanic);
            }

            // Create default receptionist user if not exists
            if (!userRepository.existsByUsername("receptionist")) {
                User receptionist = User.builder()
                        .username("receptionist")
                        .password(passwordEncoder.encode("receptionist123"))
                        .fullName("Jane Receptionist")
                        .email("receptionist@workshop.com")
                        .phone("555-0102")
                        .role(Role.RECEPTIONIST)
                        .enabled(true)
                        .build();
                userRepository.save(receptionist);
            }

            // Create default services if empty
            if (serviceItemRepository.count() == 0) {
                serviceItemRepository.save(ServiceItem.builder()
                        .name("Oil Change")
                        .description("Standard oil and filter change")
                        .basePrice(new BigDecimal("49.99"))
                        .estimatedMinutes(30)
                        .category(ServiceCategory.OIL_CHANGE)
                        .active(true)
                        .build());

                serviceItemRepository.save(ServiceItem.builder()
                        .name("Brake Pad Replacement")
                        .description("Replace front or rear brake pads")
                        .basePrice(new BigDecimal("199.99"))
                        .estimatedMinutes(90)
                        .category(ServiceCategory.BRAKES)
                        .active(true)
                        .build());

                serviceItemRepository.save(ServiceItem.builder()
                        .name("Tire Rotation")
                        .description("Rotate all four tires")
                        .basePrice(new BigDecimal("29.99"))
                        .estimatedMinutes(30)
                        .category(ServiceCategory.TIRES)
                        .active(true)
                        .build());

                serviceItemRepository.save(ServiceItem.builder()
                        .name("Engine Diagnostic")
                        .description("Full computer diagnostic scan")
                        .basePrice(new BigDecimal("89.99"))
                        .estimatedMinutes(60)
                        .category(ServiceCategory.ENGINE)
                        .active(true)
                        .build());

                serviceItemRepository.save(ServiceItem.builder()
                        .name("AC Service")
                        .description("AC system check and recharge")
                        .basePrice(new BigDecimal("149.99"))
                        .estimatedMinutes(60)
                        .category(ServiceCategory.AC_HEATING)
                        .active(true)
                        .build());

                serviceItemRepository.save(ServiceItem.builder()
                        .name("Vehicle Inspection")
                        .description("Comprehensive multi-point inspection")
                        .basePrice(new BigDecimal("39.99"))
                        .estimatedMinutes(45)
                        .category(ServiceCategory.INSPECTION)
                        .active(true)
                        .build());

                serviceItemRepository.save(ServiceItem.builder()
                        .name("Transmission Fluid Change")
                        .description("Transmission fluid drain and fill")
                        .basePrice(new BigDecimal("179.99"))
                        .estimatedMinutes(60)
                        .category(ServiceCategory.TRANSMISSION)
                        .active(true)
                        .build());

                serviceItemRepository.save(ServiceItem.builder()
                        .name("Battery Replacement")
                        .description("Test and replace battery")
                        .basePrice(new BigDecimal("159.99"))
                        .estimatedMinutes(30)
                        .category(ServiceCategory.ELECTRICAL)
                        .active(true)
                        .build());
            }
        };
    }
}
