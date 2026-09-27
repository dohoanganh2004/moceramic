package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.auth.ForgotPasswordRequestDTO;
import com.example.moceramicshop.dtos.request.auth.LoginRequestDTO;
import com.example.moceramicshop.dtos.request.auth.RefreshTokenRequestDTO;
import com.example.moceramicshop.dtos.request.auth.RegisterRequestDTO;
import com.example.moceramicshop.dtos.request.auth.ResetPasswordRequestDTO;
import com.example.moceramicshop.dtos.response.auth.LoginResponseDTO;
import com.example.moceramicshop.dtos.response.auth.RegisterResponseDTO;
import com.example.moceramicshop.services.AuthService;
import com.example.moceramicshop.services.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RateLimitService rateLimitService;

    public AuthController(AuthService authService, RateLimitService rateLimitService) {
        this.authService = authService;
        this.rateLimitService = rateLimitService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto, HttpServletRequest request) {
        rateLimitService.checkLimit("register:" + clientIp(request), 5, Duration.ofHours(1));
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto, HttpServletRequest request) {
        // Keyed on IP + phone together - brute-forcing one account from one IP
        // is what this stops; a shared office IP with many legitimate users
        // logging into their own different accounts isn't penalized.
        rateLimitService.checkLimit("login:" + clientIp(request) + ":" + dto.getPhoneNumber(), 5, Duration.ofMinutes(15));
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDTO> refresh(@Valid @RequestBody RefreshTokenRequestDTO dto) {
        return ResponseEntity.ok(authService.refresh(dto.getRefreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequestDTO dto, HttpServletRequest request) {
        String accessToken = extractAccessToken(request);
        authService.logout(accessToken, dto.getRefreshToken());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/send-password-reset-email")
    public ResponseEntity<Void> sendPasswordResetEmail(@Valid @RequestBody ForgotPasswordRequestDTO dto, HttpServletRequest request) {
        rateLimitService.checkLimit("forgot:" + clientIp(request), 3, Duration.ofHours(1));
        authService.sendPasswordResetEmail(dto.getEmail());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/password-reset")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO dto) {
        authService.resetPassword(dto.getToken(), dto.getPassword());
        return ResponseEntity.noContent().build();
    }

    private String extractAccessToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    // Trusts X-Forwarded-For because this API is expected to sit behind a
    // reverse proxy/load balancer in any real deployment; falls back to the
    // direct socket address for plain local/dev setups.
    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
