package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.blog.BlogPostRequestDTO;
import com.example.moceramicshop.dtos.response.blog.BlogPostResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.security.PermissionGuard;
import com.example.moceramicshop.services.BlogPostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/blog-posts")
public class BlogPostController {

    private final BlogPostService blogPostService;
    private final PermissionGuard permissionGuard;

    public BlogPostController(BlogPostService blogPostService, PermissionGuard permissionGuard) {
        this.blogPostService = blogPostService;
        this.permissionGuard = permissionGuard;
    }

    @PostMapping
    public ResponseEntity<BlogPostResponseDTO> create(@Valid @RequestBody BlogPostRequestDTO dto,
                                                        @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "blog");
        return ResponseEntity.status(HttpStatus.CREATED).body(blogPostService.create(dto, currentUser.getUser().getId()));
    }

    @GetMapping
    public ResponseEntity<List<BlogPostResponseDTO>> getAll(@AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "blog");
        return ResponseEntity.ok(blogPostService.getAllPosts());
    }

    private static final Set<String> SORTABLE_FIELDS = Set.of("title", "status", "publishedAt", "createdAt", "updatedAt");

    @GetMapping("/search")
    public ResponseEntity<Page<BlogPostResponseDTO>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "blog");
        String field = SORTABLE_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(field).ascending() : Sort.by(field).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);
        return ResponseEntity.ok(blogPostService.search(search, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogPostResponseDTO> getById(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "blog");
        return ResponseEntity.ok(blogPostService.getPostById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogPostResponseDTO> update(@PathVariable Long id, @Valid @RequestBody BlogPostRequestDTO dto,
                                                        @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "blog");
        return ResponseEntity.ok(blogPostService.update(id, dto));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<BlogPostResponseDTO> publish(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "blog");
        return ResponseEntity.ok(blogPostService.publish(id));
    }

    @PatchMapping("/{id}/unpublish")
    public ResponseEntity<BlogPostResponseDTO> unpublish(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "blog");
        return ResponseEntity.ok(blogPostService.unpublish(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "blog");
        blogPostService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
