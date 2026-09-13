package com.example.moceramicshop.security;

import com.example.moceramicshop.models.User;
import com.example.moceramicshop.repositories.BlacklistedTokenRepository;
import com.example.moceramicshop.repositories.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final BlacklistedTokenRepository blacklistedTokenRepository;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, UserRepository userRepository,
                                    BlacklistedTokenRepository blacklistedTokenRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = getTokenFromRequest(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            try {
                boolean isAccessToken = JwtTokenProvider.TOKEN_TYPE_ACCESS.equals(jwtTokenProvider.getTokenType(token));
                boolean isBlacklisted = blacklistedTokenRepository.existsByTokenJti(jwtTokenProvider.getJti(token));

                if (isAccessToken && !isBlacklisted) {
                    Long userId = jwtTokenProvider.getUserIdFromToken(token);
                    User user = userRepository.findWithRoleById(userId).orElse(null);

                    if (user != null && Boolean.TRUE.equals(user.getIsActive())) {
                        CustomUserDetails userDetails = new CustomUserDetails(user);
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    } else if (user != null) {
                        log.warn("Rejected request from banned userId={}", user.getId());
                    }
                }
            } catch (JwtException | IllegalArgumentException e) {
                log.warn("Could not authenticate request from JWT: {}", e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return token;
    }
}
