package com.example.moceramicshop.dtos.response.newsletter;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NewsletterSubscriberResponseDTO {
    private Long id;
    private String email;
    private Instant subscribedAt;
    private Boolean isActive;
}
