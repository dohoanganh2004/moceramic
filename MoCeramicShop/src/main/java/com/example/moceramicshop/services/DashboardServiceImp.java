package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.response.dashboard.DailyRevenueDTO;
import com.example.moceramicshop.dtos.response.dashboard.DashboardStatsResponseDTO;
import com.example.moceramicshop.dtos.response.dashboard.TopProductDTO;
import com.example.moceramicshop.repositories.OrderItemRepository;
import com.example.moceramicshop.repositories.OrderRepository;
import com.example.moceramicshop.repositories.ProductRepository;
import com.example.moceramicshop.repositories.UserRepository;
import com.example.moceramicshop.repositories.projections.DailyRevenueProjection;
import com.example.moceramicshop.repositories.projections.OrderStatusCountProjection;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class DashboardServiceImp implements DashboardService {

    private static final List<String> ORDER_STATUSES = List.of(
            "pending", "confirmed", "processing", "shipping", "delivered", "cancelled");

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public DashboardServiceImp(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                                ProductRepository productRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    public DashboardStatsResponseDTO getStats(int days) {
        int rangeDays = days > 0 ? Math.min(days, 90) : 14;

        BigDecimal totalRevenue = orderRepository.sumRevenue();
        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.countByStatus("active");
        long totalCustomers = userRepository.countByRole_Name("customer");

        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (String status : ORDER_STATUSES) {
            ordersByStatus.put(status, 0L);
        }
        for (OrderStatusCountProjection row : orderRepository.countByStatus()) {
            ordersByStatus.put(row.getStatus(), row.getCnt());
        }

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Instant from = today.minusDays(rangeDays - 1L).atStartOfDay(ZoneOffset.UTC).toInstant();
        Map<LocalDate, DailyRevenueProjection> revenueByDay = new LinkedHashMap<>();
        for (DailyRevenueProjection row : orderRepository.findDailyRevenueSince(from)) {
            revenueByDay.put(row.getDay().toLocalDate(), row);
        }

        List<DailyRevenueDTO> revenueTrend = new ArrayList<>();
        for (int i = rangeDays - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            DailyRevenueProjection row = revenueByDay.get(date);
            revenueTrend.add(new DailyRevenueDTO(
                    date,
                    row != null ? row.getRevenue() : BigDecimal.ZERO,
                    row != null ? row.getOrderCount() : 0L
            ));
        }

        List<TopProductDTO> topProducts = orderItemRepository.findTopProducts(PageRequest.of(0, 5)).stream()
                .map(row -> new TopProductDTO(row.getProductId(), row.getProductName(), row.getQuantitySold(), row.getRevenue()))
                .toList();

        log.info("Computed dashboard stats: totalRevenue={} totalOrders={} totalProducts={} totalCustomers={}",
                totalRevenue, totalOrders, totalProducts, totalCustomers);

        return new DashboardStatsResponseDTO(totalRevenue, totalOrders, totalProducts, totalCustomers,
                ordersByStatus, revenueTrend, topProducts);
    }
}
