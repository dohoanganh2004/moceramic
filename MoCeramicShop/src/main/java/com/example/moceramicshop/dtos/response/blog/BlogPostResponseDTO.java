package com.example.moceramicshop.dtos.response.blog;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlogPostResponseDTO {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private String thumbnailUrl;
    private Long authorId;
    private String authorName;
    private String status;
    private Instant publishedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
