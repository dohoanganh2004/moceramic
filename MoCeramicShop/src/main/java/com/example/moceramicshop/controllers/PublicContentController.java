package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.newsletter.NewsletterSubscribeRequestDTO;
import com.example.moceramicshop.dtos.response.banner.BannerResponseDTO;
import com.example.moceramicshop.dtos.response.blog.BlogPostResponseDTO;
import com.example.moceramicshop.dtos.response.newsletter.NewsletterSubscriberResponseDTO;
import com.example.moceramicshop.dtos.response.staticpage.StaticPageResponseDTO;
import com.example.moceramicshop.services.BannerService;
import com.example.moceramicshop.services.BlogPostService;
import com.example.moceramicshop.services.NewsletterSubscriberService;
import com.example.moceramicshop.services.StaticPageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicContentController {

    private final BlogPostService blogPostService;
    private final BannerService bannerService;
    private final StaticPageService staticPageService;
    private final NewsletterSubscriberService newsletterSubscriberService;

    public PublicContentController(BlogPostService blogPostService, BannerService bannerService,
                                    StaticPageService staticPageService, NewsletterSubscriberService newsletterSubscriberService) {
        this.blogPostService = blogPostService;
        this.bannerService = bannerService;
        this.staticPageService = staticPageService;
        this.newsletterSubscriberService = newsletterSubscriberService;
    }

    @GetMapping("/blog-posts")
    public ResponseEntity<Page<BlogPostResponseDTO>> getPublishedPosts(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(blogPostService.getPublishedPosts(pageable));
    }

    @GetMapping("/blog-posts/{slug}")
    public ResponseEntity<BlogPostResponseDTO> getPublishedPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(blogPostService.getPublishedPostBySlug(slug));
    }

    @GetMapping("/banners")
    public ResponseEntity<List<BannerResponseDTO>> getActiveBanners() {
        return ResponseEntity.ok(bannerService.getActiveBanners());
    }

    @GetMapping("/static-pages/{slug}")
    public ResponseEntity<StaticPageResponseDTO> getStaticPageBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(staticPageService.getPageBySlug(slug));
    }

    @PostMapping("/newsletter/subscribe")
    public ResponseEntity<NewsletterSubscriberResponseDTO> subscribe(@Valid @RequestBody NewsletterSubscribeRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(newsletterSubscriberService.subscribe(dto.getEmail()));
    }
}
