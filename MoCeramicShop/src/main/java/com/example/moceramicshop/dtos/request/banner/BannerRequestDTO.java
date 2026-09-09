package com.example.moceramicshop.dtos.request.banner;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
public class BannerRequestDTO {
    @Size(max = 150, message = "Title must be at most 150 characters")
    private String title;

    @NotBlank(message = "Image URL is required")
    @Size(max = 500, message = "Image URL must be at most 500 characters")
    private String imageUrl;

    @Size(max = 500, message = "Link URL must be at most 500 characters")
    private String linkUrl;

    @Size(max = 50, message = "Position must be at most 50 characters")
    private String position;

    @NotNull(message = "Sort order is required")
    private Integer sortOrder;

    private Instant startDate;

    private Instant endDate;

    @NotNull(message = "Active status is required")
    private Boolean isActive;
}
