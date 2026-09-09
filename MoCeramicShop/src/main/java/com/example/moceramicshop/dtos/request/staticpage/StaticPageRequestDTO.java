package com.example.moceramicshop.dtos.request.staticpage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StaticPageRequestDTO {
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be at most 200 characters")
    private String title;

    @NotBlank(message = "Slug is required")
    @Size(max = 220, message = "Slug must be at most 220 characters")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Slug must be lowercase letters, numbers and hyphens only")
    private String slug;

    @NotBlank(message = "Content is required")
    private String content;
}
