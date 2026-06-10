package com.qlcafe.backend.config;

import com.qlcafe.backend.repository.AccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Auto hash password if inserted as plain text in SQL script
        accountRepository.findByUsername("admin").ifPresent(admin -> {
            if (!admin.getPassword().startsWith("$2a$")) {
                admin.setPassword(passwordEncoder.encode(admin.getPassword()));
                accountRepository.save(admin);
            }
        });
    }
}
