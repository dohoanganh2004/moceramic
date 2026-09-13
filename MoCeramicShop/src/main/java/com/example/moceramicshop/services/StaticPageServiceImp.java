package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.staticpage.StaticPageRequestDTO;
import com.example.moceramicshop.dtos.response.staticpage.StaticPageResponseDTO;
import com.example.moceramicshop.exceptions.ConflictException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.StaticPageMapper;
import com.example.moceramicshop.models.StaticPage;
import com.example.moceramicshop.repositories.StaticPageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
public class StaticPageServiceImp implements StaticPageService {

    private final StaticPageRepository staticPageRepository;
    private final StaticPageMapper staticPageMapper;

    public StaticPageServiceImp(StaticPageRepository staticPageRepository, StaticPageMapper staticPageMapper) {
        this.staticPageRepository = staticPageRepository;
        this.staticPageMapper = staticPageMapper;
    }

    @Override
    public List<StaticPageResponseDTO> getAllPages() {
        return staticPageRepository.findAll().stream()
                .map(staticPageMapper::toResponseDTO)
                .toList();
    }

    @Override
    public StaticPageResponseDTO getPageById(Long id) {
        StaticPage page = staticPageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trang với id " + id));
        return staticPageMapper.toResponseDTO(page);
    }

    @Override
    public StaticPageResponseDTO create(StaticPageRequestDTO dto) {
        if (staticPageRepository.existsBySlug(dto.getSlug())) {
            throw new ConflictException("Slug đã tồn tại, vui lòng chọn slug khác");
        }
        StaticPage page = new StaticPage();
        page.setTitle(dto.getTitle());
        page.setSlug(dto.getSlug());
        page.setContent(dto.getContent());
        page.setUpdatedAt(Instant.now());
        StaticPage saved = staticPageRepository.saveAndFlush(page);
        log.info("Created static page id={} slug={}", saved.getId(), saved.getSlug());
        return staticPageMapper.toResponseDTO(saved);
    }

    @Override
    public StaticPageResponseDTO update(Long id, StaticPageRequestDTO dto) {
        StaticPage page = staticPageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trang với id " + id));
        if (!page.getSlug().equals(dto.getSlug()) && staticPageRepository.existsBySlug(dto.getSlug())) {
            throw new ConflictException("Slug đã tồn tại, vui lòng chọn slug khác");
        }
        page.setTitle(dto.getTitle());
        page.setSlug(dto.getSlug());
        page.setContent(dto.getContent());
        page.setUpdatedAt(Instant.now());
        log.info("Updated static page id={}", id);
        return staticPageMapper.toResponseDTO(staticPageRepository.saveAndFlush(page));
    }

    @Override
    public void delete(Long id) {
        if (!staticPageRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy trang với id " + id);
        }
        staticPageRepository.deleteById(id);
        log.info("Deleted static page id={}", id);
    }

    @Override
    public StaticPageResponseDTO getPageBySlug(String slug) {
        StaticPage page = staticPageRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trang"));
        return staticPageMapper.toResponseDTO(page);
    }
}
