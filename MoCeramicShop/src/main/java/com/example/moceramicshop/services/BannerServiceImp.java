package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.banner.BannerRequestDTO;
import com.example.moceramicshop.dtos.response.banner.BannerResponseDTO;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.BannerMapper;
import com.example.moceramicshop.models.Banner;
import com.example.moceramicshop.repositories.BannerRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
public class BannerServiceImp implements BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;

    public BannerServiceImp(BannerRepository bannerRepository, BannerMapper bannerMapper) {
        this.bannerRepository = bannerRepository;
        this.bannerMapper = bannerMapper;
    }

    @Override
    public List<BannerResponseDTO> getAllBanners() {
        return bannerRepository.findAll().stream()
                .map(bannerMapper::toResponseDTO)
                .toList();
    }

    @Override
    public BannerResponseDTO getBannerById(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy banner với id " + id));
        return bannerMapper.toResponseDTO(banner);
    }

    @Override
    public BannerResponseDTO create(BannerRequestDTO dto) {
        Banner banner = new Banner();
        applyRequest(banner, dto);
        Banner saved = bannerRepository.saveAndFlush(banner);
        log.info("Created banner id={}", saved.getId());
        return bannerMapper.toResponseDTO(saved);
    }

    @Override
    public BannerResponseDTO update(Long id, BannerRequestDTO dto) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy banner với id " + id));
        applyRequest(banner, dto);
        log.info("Updated banner id={}", id);
        return bannerMapper.toResponseDTO(bannerRepository.saveAndFlush(banner));
    }

    @Override
    public void delete(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy banner với id " + id);
        }
        bannerRepository.deleteById(id);
        log.info("Deleted banner id={}", id);
    }

    @Override
    public List<BannerResponseDTO> getActiveBanners() {
        return bannerRepository.findActiveBanners(Instant.now()).stream()
                .map(bannerMapper::toResponseDTO)
                .toList();
    }

    private void applyRequest(Banner banner, BannerRequestDTO dto) {
        banner.setTitle(dto.getTitle());
        banner.setImageUrl(dto.getImageUrl());
        banner.setLinkUrl(dto.getLinkUrl());
        banner.setPosition(dto.getPosition() != null ? dto.getPosition() : "homepage_top");
        banner.setSortOrder(dto.getSortOrder());
        banner.setStartDate(dto.getStartDate());
        banner.setEndDate(dto.getEndDate());
        banner.setIsActive(dto.getIsActive());
    }
}
