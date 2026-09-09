package com.example.moceramicshop.dtos.response.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long id;

    private String fullName;

    private String email;

    private String phone;

    private String oauthProvider;

    private String avatarUrl;

    private Integer roleID;

    private String roleName;

    private Boolean isActive;

    private Instant createdAt;

    private Instant updatedAt;
}
