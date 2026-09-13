package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.response.dashboard.DashboardStatsResponseDTO;

public interface DashboardService {
    DashboardStatsResponseDTO getStats(int days);
}
