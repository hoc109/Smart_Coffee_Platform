package com.qlcafe.backend.service;

import com.qlcafe.backend.dto.AccountRequest;
import com.qlcafe.backend.entity.Account;
import com.qlcafe.backend.repository.AccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountService {
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Account createAccount(AccountRequest request) {
        if (accountRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setRole(request.getRole());
        return accountRepository.save(account);
    }

    public Account updateAccount(Integer id, AccountRequest request) {
        Account account = accountRepository.findById(id).orElseThrow(() -> new RuntimeException("Account not found"));
        account.setRole(request.getRole());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            account.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return accountRepository.save(account);
    }

    public void deleteAccount(Integer id) {
        accountRepository.deleteById(id);
    }
}
