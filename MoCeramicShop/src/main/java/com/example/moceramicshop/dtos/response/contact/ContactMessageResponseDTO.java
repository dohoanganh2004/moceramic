package com.example.moceramicshop.dtos.response.contact;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessageResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private String status;
    private Instant createdAt;
}
