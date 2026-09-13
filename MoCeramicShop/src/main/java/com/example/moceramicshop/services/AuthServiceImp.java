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
import com.example.moceramicshop.models.BlacklistedToken;
import com.example.moceramicshop.models.Role;
import com.example.moceramicshop.models.User;
import com.example.moceramicshop.repositories.BlacklistedTokenRepository;
import com.example.moceramicshop.repositories.RoleRepository;
import com.example.moceramicshop.repositories.UserRepository;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

import static com.example.moceramicshop.security.JwtTokenProvider.TOKEN_TYPE_ACCESS;
import static com.example.moceramicshop.security.JwtTokenProvider.TOKEN_TYPE_REFRESH;

@Slf4j
@Service
public class AuthServiceImp implements AuthService {

    private static final int DEFAULT_ROLE_ID_CUSTOMER = 1;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImp(UserRepository userRepository, RoleRepository roleRepository,
                           BlacklistedTokenRepository blacklistedTokenRepository, PasswordEncoder passwordEncoder,
                           UserMapper userMapper, JwtTokenProvider jwtTokenProvider,
                           AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
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

        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
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
        if (blacklistedTokenRepository.existsByTokenJti(jwtTokenProvider.getJti(refreshToken))) {
            log.warn("Attempt to use blacklisted refresh token jti={}", jwtTokenProvider.getJti(refreshToken));
            throw new UnauthorizedException("Refresh token đã bị thu hồi");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findWithRoleById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id " + userId));

        String newAccessToken = jwtTokenProvider.generateAccessToken(new CustomUserDetails(user));
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
        if (blacklistedTokenRepository.existsByTokenJti(jti)) {
            return;
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return;
        }

        BlacklistedToken blacklistedToken = new BlacklistedToken();
        blacklistedToken.setTokenJti(jti);
        blacklistedToken.setUser(user);
        blacklistedToken.setTokenType(expectedType);
        blacklistedToken.setReason("logout");
        blacklistedToken.setExpiresAt(jwtTokenProvider.getExpirationDate(token).toInstant());
        blacklistedToken.setBlacklistedAt(Instant.now());
        blacklistedTokenRepository.save(blacklistedToken);
    }
}
