package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.blog.BlogPostRequestDTO;
import com.example.moceramicshop.dtos.response.blog.BlogPostResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BlogPostService {
    List<BlogPostResponseDTO> getAllPosts();
    Page<BlogPostResponseDTO> search(String search, String status, Pageable pageable);
    BlogPostResponseDTO getPostById(Long id);
    BlogPostResponseDTO create(BlogPostRequestDTO dto, Long authorUserId);
    BlogPostResponseDTO update(Long id, BlogPostRequestDTO dto);
    BlogPostResponseDTO publish(Long id);
    BlogPostResponseDTO unpublish(Long id);
    void delete(Long id);

    Page<BlogPostResponseDTO> getPublishedPosts(Pageable pageable);
    BlogPostResponseDTO getPublishedPostBySlug(String slug);
}
