package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.user.ChangePasswordRequestDTO;
import com.example.moceramicshop.dtos.request.user.CreateUserRequestDTO;
import com.example.moceramicshop.dtos.request.user.UpdateProfileRequestDTO;
import com.example.moceramicshop.dtos.request.user.UpdateUserRequestDTO;
import com.example.moceramicshop.dtos.response.user.UserResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody CreateUserRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    private static final Set<String> SORTABLE_FIELDS = Set.of("fullName", "email", "createdAt", "updatedAt");

    @GetMapping("/search")
    public ResponseEntity<Page<UserResponseDTO>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer roleId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String field = SORTABLE_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(field).ascending() : Sort.by(field).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);
        return ResponseEntity.ok(userService.search(search, roleId, isActive, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequestDTO request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ban")
    public ResponseEntity<UserResponseDTO> banUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.banUser(id));
    }

    @PatchMapping("/{id}/unban")
    public ResponseEntity<UserResponseDTO> unbanUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.unbanUser(id));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMyProfile(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(userService.getUserById(currentUser.getUser().getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateMyProfile(@Valid @RequestBody UpdateProfileRequestDTO request,
                                                             @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(userService.updateProfile(currentUser.getUser().getId(), request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changeMyPassword(@Valid @RequestBody ChangePasswordRequestDTO request,
                                                   @AuthenticationPrincipal CustomUserDetails currentUser,
                                                   HttpServletRequest httpRequest) {
        userService.changePassword(currentUser.getUser().getId(), request, extractAccessToken(httpRequest));
        return ResponseEntity.noContent().build();
    }

    private String extractAccessToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
