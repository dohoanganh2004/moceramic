package com.example.moceramicshop.dtos.request.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequestDTO {
    private Long parentId;

    @NotBlank(message = "Name is required")
    @Size(max = 150, message = "Name must be at most 150 characters")
    private String name;

    @NotBlank(message = "Slug is required")
    @Size(max = 180, message = "Slug must be at most 180 characters")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Slug must be lowercase letters, numbers and hyphens only")
    private String slug;

    private String description;

    @Size(max = 500, message = "Image URL must be at most 500 characters")
    private String imageUrl;

    private Integer sortOrder;
}
