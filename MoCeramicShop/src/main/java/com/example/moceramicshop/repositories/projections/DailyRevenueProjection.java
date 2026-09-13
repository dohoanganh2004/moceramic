package com.example.moceramicshop.repositories.projections;

import java.math.BigDecimal;
import java.sql.Date;

public interface DailyRevenueProjection {
    Date getDay();
    BigDecimal getRevenue();
    Long getOrderCount();
}
