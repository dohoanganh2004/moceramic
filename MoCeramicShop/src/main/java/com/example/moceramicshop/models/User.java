package com.example.moceramicshop.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "oauth_provider", length = 30)
    private String oauthProvider;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "reset_token_hash", length = 64)
    private String resetTokenHash;

    @Column(name = "reset_token_expires_at")
    private Instant resetTokenExpiresAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ColumnDefault("1")
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

}