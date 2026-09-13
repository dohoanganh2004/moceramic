package com.example.moceramicshop.repositories.projections;

import java.math.BigDecimal;

public interface TopProductProjection {
    Long getProductId();
    String getProductName();
    Long getQuantitySold();
    BigDecimal getRevenue();
}
