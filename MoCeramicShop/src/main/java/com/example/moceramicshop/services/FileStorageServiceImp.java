package com.example.moceramicshop.services;

import com.example.moceramicshop.exceptions.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageServiceImp implements FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final Path uploadRoot;
    private final String publicBasePath;

    public FileStorageServiceImp(@Value("${app.upload.dir:uploads}") String uploadDir,
                                  @Value("${app.upload.public-path:/uploads}") String publicBasePath) {
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
        this.publicBasePath = publicBasePath;
        try {
            Files.createDirectories(uploadRoot);
        } catch (IOException e) {
            throw new RuntimeException("Không thể khởi tạo thư mục lưu ảnh: " + uploadRoot, e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File ảnh không được để trống");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Định dạng ảnh không được hỗ trợ: " + contentType);
        }

        String extension = extractExtension(file.getOriginalFilename());
        String storedName = UUID.randomUUID() + extension;
        Path target = uploadRoot.resolve(storedName).normalize();

        if (!target.getParent().equals(uploadRoot)) {
            throw new BadRequestException("Tên file không hợp lệ");
        }

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Lưu file ảnh thất bại: " + file.getOriginalFilename(), e);
        }

        return publicBasePath + "/" + storedName;
    }

    @Override
    public void delete(String publicUrl) {
        if (publicUrl == null || !publicUrl.startsWith(publicBasePath + "/")) {
            return;
        }
        String storedName = publicUrl.substring((publicBasePath + "/").length());
        Path target = uploadRoot.resolve(storedName).normalize();

        if (!target.getParent().equals(uploadRoot)) {
            return;
        }

        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new RuntimeException("Xóa file ảnh thất bại: " + storedName, e);
        }
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dotIndex = originalFilename.lastIndexOf('.');
        return dotIndex >= 0 ? originalFilename.substring(dotIndex).toLowerCase() : "";
    }
}
