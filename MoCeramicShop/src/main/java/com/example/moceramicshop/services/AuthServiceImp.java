package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.auth.LoginRequestDTO;
import com.example.moceramicshop.dtos.request.auth.RegisterRequestDTO;
import com.example.moceramicshop.dtos.response.auth.LoginResponseDTO;
import com.example.moceramicshop.dtos.response.auth.RegisterResponseDTO;
import com.example.moceramicshop.exceptions.BadRequestException;
import com.example.moceramicshop.exceptions.ConflictException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.exceptions.UnauthorizedException;
import com.example.moceramicshop.mappers.UserMapper;
import com.example.moceramicshop.models.Role;
import com.example.moceramicshop.models.User;
import com.example.moceramicshop.repositories.RolePermissionRepository;
import com.example.moceramicshop.repositories.RoleRepository;
import com.example.moceramicshop.repositories.UserRepository;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;

import static com.example.moceramicshop.security.JwtTokenProvider.TOKEN_TYPE_ACCESS;
import static com.example.moceramicshop.security.JwtTokenProvider.TOKEN_TYPE_REFRESH;

@Slf4j
@Service
public class AuthServiceImp implements AuthService {

    private static final int DEFAULT_ROLE_ID_CUSTOMER = 1;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final TokenBlacklistService tokenBlacklistService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private static final int RESET_TOKEN_VALID_HOURS = 1;

    public AuthServiceImp(UserRepository userRepository, RoleRepository roleRepository,
                           RolePermissionRepository rolePermissionRepository,
                           TokenBlacklistService tokenBlacklistService, PasswordEncoder passwordEncoder,
                           UserMapper userMapper, JwtTokenProvider jwtTokenProvider,
                           AuthenticationManager authenticationManager, EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.tokenBlacklistService = tokenBlacklistService;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    private List<String> getPermissionCodes(Integer roleId) {
        return rolePermissionRepository.findByRoleId(roleId).stream()
                .map(rp -> rp.getPermission().getCode())
                .toList();
    }

    @Override
    public RegisterResponseDTO register(RegisterRequestDTO dto) {
        if (userRepository.getUserByEmail(dto.getEmail()) != null) {
            log.warn("Register attempt with existing email: {}", dto.getEmail());
            throw new ConflictException("Email đã tồn tại, vui lòng sử dụng email khác");
        }
        String phone = dto.getPhoneNumber();
        if (phone != null && userRepository.getUserByPhone(phone) != null) {
            log.warn("Register attempt with existing phone: {}", phone);
            throw new ConflictException("Số điện thoại đã tồn tại, vui lòng sử dụng số điện thoại khác");
        }
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu xác nhận không trùng với mật khẩu nhập vào");
        }

        Role role = roleRepository.findById(DEFAULT_ROLE_ID_CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Role mặc định không tồn tại"));

        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));

        user.setRole(role);
        user.setIsActive(true);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        User savedUser = userRepository.saveAndFlush(user);
        log.info("Registered new user id={} email={}", savedUser.getId(), savedUser.getEmail());
        return userMapper.toRegisterResponseDTO(savedUser);
    }

    @Override
    public LoginResponseDTO login(LoginRequestDTO dto) {
        User existingUser = userRepository.getUserByPhone(dto.getPhoneNumber());
        if (existingUser != null && !Boolean.TRUE.equals(existingUser.getIsActive())) {
            log.warn("Login attempt from banned userId={} phoneNumber={}", existingUser.getId(), dto.getPhoneNumber());
            throw new UnauthorizedException("Tài khoản của bạn đã bị khóa, vui lòng liên hệ quản trị viên để biết thêm chi tiết");
        }

        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(dto.getPhoneNumber(), dto.getPassword());
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(authenticationToken);
        } catch (AuthenticationException e) {
            log.warn("Failed login attempt for phoneNumber={}: {}", dto.getPhoneNumber(), e.getMessage());
            throw e;
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        String accessToken = jwtTokenProvider.generateAccessToken(userDetails, getPermissionCodes(userDetails.getUser().getRole().getId()));
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);
        log.info("User id={} logged in", userDetails.getUser().getId());
        return new LoginResponseDTO(accessToken, refreshToken);
    }

    @Override
    public LoginResponseDTO refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn");
        }
        if (!TOKEN_TYPE_REFRESH.equals(jwtTokenProvider.getTokenType(refreshToken))) {
            throw new UnauthorizedException("Token này không phải refresh token");
        }
        if (tokenBlacklistService.isBlacklisted(jwtTokenProvider.getJti(refreshToken))) {
            log.warn("Attempt to use blacklisted refresh token jti={}", jwtTokenProvider.getJti(refreshToken));
            throw new UnauthorizedException("Refresh token đã bị thu hồi");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findWithRoleById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id " + userId));

        String newAccessToken = jwtTokenProvider.generateAccessToken(new CustomUserDetails(user), getPermissionCodes(user.getRole().getId()));
        log.info("Issued new access token for userId={}", userId);
        return new LoginResponseDTO(newAccessToken, refreshToken);
    }

    @Override
    public void logout(String accessToken, String refreshToken) {
        blacklistIfValid(accessToken, TOKEN_TYPE_ACCESS);
        blacklistIfValid(refreshToken, TOKEN_TYPE_REFRESH);
        log.info("Logout processed, tokens blacklisted where valid");
    }

    @Override
    public void blacklistAccessToken(String accessToken) {
        blacklistIfValid(accessToken, TOKEN_TYPE_ACCESS);
    }

    private void blacklistIfValid(String token, String expectedType) {
        if (token == null || !jwtTokenProvider.validateToken(token)) {
            return;
        }
        if (!expectedType.equals(jwtTokenProvider.getTokenType(token))) {
            return;
        }
        String jti = jwtTokenProvider.getJti(token);
        if (tokenBlacklistService.isBlacklisted(jti)) {
            return;
        }
        tokenBlacklistService.blacklist(jti, jwtTokenProvider.getExpirationDate(token).toInstant());
    }

    @Override
    @Transactional
    public void sendPasswordResetEmail(String email) {
        User user = userRepository.getUserByEmail(email);
        if (user == null) {
            // Don't reveal whether an email is registered - respond the same
            // either way and just skip actually sending anything.
            log.info("Password reset requested for unknown email={}", email);
            return;
        }

        String rawToken = generateRawToken();
        user.setResetTokenHash(sha256Hex(rawToken));
        user.setResetTokenExpiresAt(Instant.now().plus(RESET_TOKEN_VALID_HOURS, ChronoUnit.HOURS));
        userRepository.save(user);

        String resetLink = frontendUrl + "/reset?token=" + rawToken;
        String html = "<p>Hi " + user.getFullName() + ",</p>"
                + "<p>We received a request to reset your MoCeramic password. This link expires in "
                + RESET_TOKEN_VALID_HOURS + " hour.</p>"
                + "<p><a href=\"" + resetLink + "\">Reset your password</a></p>"
                + "<p>If you didn't request this, you can safely ignore this email.</p>";
        emailService.send(user.getEmail(), "Reset your MoCeramic password", html);
        log.info("Password reset email sent for userId={}", user.getId());
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetTokenHash(sha256Hex(token))
                .orElseThrow(() -> new BadRequestException("This reset link is invalid or has expired"));
        if (user.getResetTokenExpiresAt() == null || user.getResetTokenExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("This reset link is invalid or has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetTokenHash(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);
        log.info("Password reset completed for userId={}", user.getId());
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
