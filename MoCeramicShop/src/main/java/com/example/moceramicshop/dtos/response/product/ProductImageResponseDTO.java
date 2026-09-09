package com.example.moceramicshop.dtos.response.product;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageResponseDTO {
    private Long id;
    private String imageUrl;
    private Integer sortOrder;
    private Boolean isPrimary;
}
