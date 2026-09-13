package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.contact.ContactMessageRequestDTO;
import com.example.moceramicshop.dtos.request.customorder.CustomOrderRequestDTO;
import com.example.moceramicshop.dtos.request.newsletter.NewsletterSubscribeRequestDTO;
import com.example.moceramicshop.dtos.response.banner.BannerResponseDTO;
import com.example.moceramicshop.dtos.response.blog.BlogPostResponseDTO;
import com.example.moceramicshop.dtos.response.contact.ContactMessageResponseDTO;
import com.example.moceramicshop.dtos.response.customorder.CustomOrderResponseDTO;
import com.example.moceramicshop.dtos.response.newsletter.NewsletterSubscriberResponseDTO;
import com.example.moceramicshop.dtos.response.staticpage.StaticPageResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.services.BannerService;
import com.example.moceramicshop.services.BlogPostService;
import com.example.moceramicshop.services.ContactMessageService;
import com.example.moceramicshop.services.CustomOrderService;
import com.example.moceramicshop.services.NewsletterSubscriberService;
import com.example.moceramicshop.services.StaticPageService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicContentController {

    private final BlogPostService blogPostService;
    private final BannerService bannerService;
    private final StaticPageService staticPageService;
    private final NewsletterSubscriberService newsletterSubscriberService;
    private final ContactMessageService contactMessageService;
    private final CustomOrderService customOrderService;

    public PublicContentController(BlogPostService blogPostService, BannerService bannerService,
                                    StaticPageService staticPageService, NewsletterSubscriberService newsletterSubscriberService,
                                    ContactMessageService contactMessageService, CustomOrderService customOrderService) {
        this.blogPostService = blogPostService;
        this.bannerService = bannerService;
        this.staticPageService = staticPageService;
        this.newsletterSubscriberService = newsletterSubscriberService;
        this.contactMessageService = contactMessageService;
        this.customOrderService = customOrderService;
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

    @PostMapping("/contact-messages")
    public ResponseEntity<ContactMessageResponseDTO> submitContactMessage(@Valid @RequestBody ContactMessageRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactMessageService.submit(dto));
    }

    @PostMapping(value = "/custom-orders", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CustomOrderResponseDTO> submitCustomOrder(@RequestPart("data") @Valid CustomOrderRequestDTO dto,
                                                                      @RequestPart(value = "files", required = false) List<MultipartFile> files,
                                                                      @AuthenticationPrincipal CustomUserDetails currentUser) {
        Long userId = currentUser != null ? currentUser.getUser().getId() : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(customOrderService.submit(userId, dto, files));
    }
}
