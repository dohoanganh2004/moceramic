package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.staticpage.StaticPageRequestDTO;
import com.example.moceramicshop.dtos.response.staticpage.StaticPageResponseDTO;
import com.example.moceramicshop.services.StaticPageService;
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
@RequestMapping("/api/static-pages")
public class StaticPageController {

    private final StaticPageService staticPageService;

    public StaticPageController(StaticPageService staticPageService) {
        this.staticPageService = staticPageService;
    }

    @PostMapping
    public ResponseEntity<StaticPageResponseDTO> create(@Valid @RequestBody StaticPageRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(staticPageService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<StaticPageResponseDTO>> getAll() {
        return ResponseEntity.ok(staticPageService.getAllPages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaticPageResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(staticPageService.getPageById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaticPageResponseDTO> update(@PathVariable Long id, @Valid @RequestBody StaticPageRequestDTO dto) {
        return ResponseEntity.ok(staticPageService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        staticPageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
