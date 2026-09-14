package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.response.dashboard.DashboardStatsResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.security.PermissionGuard;
import com.example.moceramicshop.services.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final PermissionGuard permissionGuard;

    public DashboardController(DashboardService dashboardService, PermissionGuard permissionGuard) {
        this.dashboardService = dashboardService;
        this.permissionGuard = permissionGuard;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponseDTO> getStats(@RequestParam(defaultValue = "14") int days,
                                                                @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "dashboard");
        return ResponseEntity.ok(dashboardService.getStats(days));
    }
}
