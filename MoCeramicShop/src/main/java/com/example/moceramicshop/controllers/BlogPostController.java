package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.blog.BlogPostRequestDTO;
import com.example.moceramicshop.dtos.response.blog.BlogPostResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.services.BlogPostService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/blog-posts")
public class BlogPostController {

    private final BlogPostService blogPostService;

    public BlogPostController(BlogPostService blogPostService) {
        this.blogPostService = blogPostService;
    }

    @PostMapping
    public ResponseEntity<BlogPostResponseDTO> create(@Valid @RequestBody BlogPostRequestDTO dto,
                                                        @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blogPostService.create(dto, currentUser.getUser().getId()));
    }

    @GetMapping
    public ResponseEntity<List<BlogPostResponseDTO>> getAll() {
        return ResponseEntity.ok(blogPostService.getAllPosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogPostResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(blogPostService.getPostById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogPostResponseDTO> update(@PathVariable Long id, @Valid @RequestBody BlogPostRequestDTO dto) {
        return ResponseEntity.ok(blogPostService.update(id, dto));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<BlogPostResponseDTO> publish(@PathVariable Long id) {
        return ResponseEntity.ok(blogPostService.publish(id));
    }

    @PatchMapping("/{id}/unpublish")
    public ResponseEntity<BlogPostResponseDTO> unpublish(@PathVariable Long id) {
        return ResponseEntity.ok(blogPostService.unpublish(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        blogPostService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
