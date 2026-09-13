package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.response.dashboard.DashboardStatsResponseDTO;
import com.example.moceramicshop.services.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponseDTO> getStats(@RequestParam(defaultValue = "14") int days) {
        return ResponseEntity.ok(dashboardService.getStats(days));
    }
}
