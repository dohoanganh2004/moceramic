package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.banner.BannerRequestDTO;
import com.example.moceramicshop.dtos.response.banner.BannerResponseDTO;
import com.example.moceramicshop.services.BannerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
public class BannerController {

    private final BannerService bannerService;

    public BannerController(BannerService bannerService) {
        this.bannerService = bannerService;
    }

    @PostMapping
    public ResponseEntity<BannerResponseDTO> create(@Valid @RequestBody BannerRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bannerService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<BannerResponseDTO>> getAll() {
        return ResponseEntity.ok(bannerService.getAllBanners());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BannerResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bannerService.getBannerById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BannerResponseDTO> update(@PathVariable Long id, @Valid @RequestBody BannerRequestDTO dto) {
        return ResponseEntity.ok(bannerService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bannerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
