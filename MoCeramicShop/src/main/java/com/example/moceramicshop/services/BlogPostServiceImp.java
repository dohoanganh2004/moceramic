package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.blog.BlogPostRequestDTO;
import com.example.moceramicshop.dtos.response.blog.BlogPostResponseDTO;
import com.example.moceramicshop.exceptions.ConflictException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.BlogPostMapper;
import com.example.moceramicshop.models.BlogPost;
import com.example.moceramicshop.models.User;
import com.example.moceramicshop.repositories.BlogPostRepository;
import com.example.moceramicshop.repositories.UserRepository;
import com.example.moceramicshop.specifications.BlogPostSpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
public class BlogPostServiceImp implements BlogPostService {

    private static final String STATUS_DRAFT = "draft";
    private static final String STATUS_PUBLISHED = "published";

    private final BlogPostRepository blogPostRepository;
    private final UserRepository userRepository;
    private final BlogPostMapper blogPostMapper;

    public BlogPostServiceImp(BlogPostRepository blogPostRepository, UserRepository userRepository, BlogPostMapper blogPostMapper) {
        this.blogPostRepository = blogPostRepository;
        this.userRepository = userRepository;
        this.blogPostMapper = blogPostMapper;
    }

    @Override
    public Page<BlogPostResponseDTO> search(String search, String status, Pageable pageable) {
        Specification<BlogPost> spec = Specification
                .where(BlogPostSpecification.hasTitleContaining(search))
                .and(BlogPostSpecification.hasStatus(status));
        log.info("Searching blog posts: search={} status={} page={}", search, status, pageable);
        return blogPostRepository.findAll(spec, pageable).map(blogPostMapper::toResponseDTO);
    }

    @Override
    public List<BlogPostResponseDTO> getAllPosts() {
        return blogPostRepository.findAll().stream()
                .map(blogPostMapper::toResponseDTO)
                .toList();
    }

    @Override
    public BlogPostResponseDTO getPostById(Long id) {
        BlogPost post = blogPostRepository.findWithAuthorById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id " + id));
        return blogPostMapper.toResponseDTO(post);
    }

    @Override
    public BlogPostResponseDTO create(BlogPostRequestDTO dto, Long authorUserId) {
        if (blogPostRepository.existsBySlug(dto.getSlug())) {
            throw new ConflictException("Slug đã tồn tại, vui lòng chọn slug khác");
        }
        User author = userRepository.findById(authorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id " + authorUserId));

        BlogPost post = new BlogPost();
        post.setTitle(dto.getTitle());
        post.setSlug(dto.getSlug());
        post.setContent(dto.getContent());
        post.setThumbnailUrl(dto.getThumbnailUrl());
        post.setAuthor(author);
        post.setStatus(STATUS_DRAFT);
        post.setCreatedAt(Instant.now());
        post.setUpdatedAt(Instant.now());

        BlogPost saved = blogPostRepository.saveAndFlush(post);
        log.info("Created blog post id={} slug={}", saved.getId(), saved.getSlug());
        return blogPostMapper.toResponseDTO(blogPostRepository.findWithAuthorById(saved.getId()).orElseThrow());
    }

    @Override
    public BlogPostResponseDTO update(Long id, BlogPostRequestDTO dto) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id " + id));

        if (!post.getSlug().equals(dto.getSlug()) && blogPostRepository.existsBySlug(dto.getSlug())) {
            throw new ConflictException("Slug đã tồn tại, vui lòng chọn slug khác");
        }

        post.setTitle(dto.getTitle());
        post.setSlug(dto.getSlug());
        post.setContent(dto.getContent());
        post.setThumbnailUrl(dto.getThumbnailUrl());
        post.setUpdatedAt(Instant.now());

        BlogPost saved = blogPostRepository.saveAndFlush(post);
        log.info("Updated blog post id={}", id);
        return blogPostMapper.toResponseDTO(blogPostRepository.findWithAuthorById(saved.getId()).orElseThrow());
    }

    @Override
    public BlogPostResponseDTO publish(Long id) {
        BlogPost post = blogPostRepository.findWithAuthorById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id " + id));
        post.setStatus(STATUS_PUBLISHED);
        post.setPublishedAt(Instant.now());
        post.setUpdatedAt(Instant.now());
        log.info("Published blog post id={}", id);
        return blogPostMapper.toResponseDTO(blogPostRepository.saveAndFlush(post));
    }

    @Override
    public BlogPostResponseDTO unpublish(Long id) {
        BlogPost post = blogPostRepository.findWithAuthorById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id " + id));
        post.setStatus(STATUS_DRAFT);
        post.setPublishedAt(null);
        post.setUpdatedAt(Instant.now());
        log.info("Unpublished blog post id={}", id);
        return blogPostMapper.toResponseDTO(blogPostRepository.saveAndFlush(post));
    }

    @Override
    public void delete(Long id) {
        if (!blogPostRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy bài viết với id " + id);
        }
        blogPostRepository.deleteById(id);
        log.info("Deleted blog post id={}", id);
    }

    @Override
    public Page<BlogPostResponseDTO> getPublishedPosts(Pageable pageable) {
        return blogPostRepository.findByStatusOrderByPublishedAtDesc(STATUS_PUBLISHED, pageable)
                .map(blogPostMapper::toResponseDTO);
    }

    @Override
    public BlogPostResponseDTO getPublishedPostBySlug(String slug) {
        BlogPost post = blogPostRepository.findWithAuthorBySlugAndStatus(slug, STATUS_PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết"));
        return blogPostMapper.toResponseDTO(post);
    }
}
