package com.example.moceramicshop.dtos.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponseDTO {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalProducts;
    private long totalCustomers;
    private Map<String, Long> ordersByStatus;
    private List<DailyRevenueDTO> revenueTrend;
    private List<TopProductDTO> topProducts;
}
