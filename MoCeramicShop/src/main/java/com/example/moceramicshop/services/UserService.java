package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.user.ChangePasswordRequestDTO;
import com.example.moceramicshop.dtos.request.user.CreateUserRequestDTO;
import com.example.moceramicshop.dtos.request.user.UpdateProfileRequestDTO;
import com.example.moceramicshop.dtos.request.user.UpdateUserRequestDTO;
import com.example.moceramicshop.dtos.response.user.UserResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    List<UserResponseDTO> getAllUsers();
    Page<UserResponseDTO> search(String search, Integer roleId, Boolean isActive, Pageable pageable);
    UserResponseDTO getUserById(Long id);
    UserResponseDTO create(CreateUserRequestDTO request);
    UserResponseDTO updateUser(Long id, UpdateUserRequestDTO request);
    void deleteUserById(Long id);
    UserResponseDTO updateProfile(Long currentUserId, UpdateProfileRequestDTO request);
    UserResponseDTO updateAvatar(Long currentUserId, MultipartFile file);
    void changePassword(Long currentUserId, ChangePasswordRequestDTO request, String currentAccessToken);
    UserResponseDTO banUser(Long id);
    UserResponseDTO unbanUser(Long id);
}
