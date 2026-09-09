package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.auth.LoginRequestDTO;
import com.example.moceramicshop.dtos.request.auth.RegisterRequestDTO;
import com.example.moceramicshop.dtos.response.auth.LoginResponseDTO;
import com.example.moceramicshop.dtos.response.auth.RegisterResponseDTO;

public interface AuthService {
    RegisterResponseDTO register(RegisterRequestDTO registerRequestDTO);
    LoginResponseDTO login(LoginRequestDTO loginRequestDTO);
    LoginResponseDTO refresh(String refreshToken);
    void logout(String accessToken, String refreshToken);
    void blacklistAccessToken(String accessToken);
}
