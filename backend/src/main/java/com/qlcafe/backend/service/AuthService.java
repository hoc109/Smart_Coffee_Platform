package com.qlcafe.backend.service;

import com.qlcafe.backend.dto.AuthRequest;
import com.qlcafe.backend.dto.AuthResponse;
import com.qlcafe.backend.dto.GoogleAuthRequest;
import com.qlcafe.backend.entity.Account;
import com.qlcafe.backend.repository.AccountRepository;
import com.qlcafe.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.google.client-id:}")
    private String googleClientId;

    public AuthService(AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider, AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        Account account = accountRepository.findByUsername(request.getUsername()).orElseThrow();
        return new AuthResponse(jwt, account.getUsername(), account.getRole());
    }

    public void register(AuthRequest request) {
        if (accountRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setRole("STAFF");
        accountRepository.save(account);
    }

    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        if (request == null || request.getIdToken() == null || request.getIdToken().trim().isEmpty()) {
            throw new IllegalArgumentException("Google ID token không được để trống");
        }

        String idToken = request.getIdToken().trim();
        String email = null;

        // Hỗ trợ chế độ demo/mock khi chạy kiểm thử local
        if (idToken.startsWith("demo-google-token-") || idToken.startsWith("mock-google-token-")) {
            email = idToken.replace("demo-google-token-", "").replace("mock-google-token-", "");
            if (!email.contains("@")) {
                email = email + "@gmail.com";
            }
        } else {
            // Xác thực token chính thức với Google Identity Services
            try {
                String googleVerifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        googleVerifyUrl,
                        HttpMethod.GET,
                        null,
                        new ParameterizedTypeReference<Map<String, Object>>() {}
                );

                Map<String, Object> body = response.getBody();
                if (body == null || !body.containsKey("email")) {
                    throw new RuntimeException("Không tìm thấy thông tin email từ Google Token");
                }

                // Kiểm tra aud nếu có cấu hình Google Client ID
                if (googleClientId != null && !googleClientId.trim().isEmpty()) {
                    String aud = (String) body.get("aud");
                    if (aud != null && !googleClientId.equals(aud)) {
                        System.err.println("[GoogleAuth] Client ID mismatch: aud=" + aud + ", configured=" + googleClientId);
                    }
                }

                email = (String) body.get("email");
            } catch (Exception e) {
                System.err.println("[GoogleAuth] Error verifying Google ID Token: " + e.getMessage());
                throw new RuntimeException("Xác thực tài khoản Google thất bại hoặc token đã hết hạn");
            }
        }

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Không thể xác định email tài khoản Google");
        }

        final String finalEmail = email.toLowerCase().trim();

        // Tìm hoặc tạo tài khoản mới với role mặc định là STAFF
        Account account = accountRepository.findByUsername(finalEmail).orElseGet(() -> {
            Account newAccount = new Account();
            newAccount.setUsername(finalEmail);
            newAccount.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            newAccount.setRole("STAFF");
            return accountRepository.save(newAccount);
        });

        // Sinh JWT token cho phiên đăng nhập
        String jwt = tokenProvider.generateTokenFromUsername(account.getUsername());
        return new AuthResponse(jwt, account.getUsername(), account.getRole());
    }
}

