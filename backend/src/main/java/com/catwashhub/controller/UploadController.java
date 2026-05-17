package com.catwashhub.controller;

import com.catwashhub.common.ApiResponse;
import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    @Value("${upload.path}")
    private String m_UploadPath;

    @Value("${upload.url-prefix}")
    private String m_UrlPrefix;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final java.util.Set<String> ALLOWED_TYPES = java.util.Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    @PostMapping("/image")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile _file) {
        if (_file.isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
        if (_file.getSize() > MAX_FILE_SIZE) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
        String contentType = _file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        try {
            Path uploadDir = Paths.get(m_UploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String ext = getExtension(_file.getOriginalFilename());
            String fileName = UUID.randomUUID() + ext;
            Files.copy(_file.getInputStream(), uploadDir.resolve(fileName));

            String url = m_UrlPrefix + "/" + fileName;
            return ResponseEntity.ok(ApiResponse.ok(url));
        } catch (IOException ex) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    private String getExtension(String _originalFilename) {
        if (_originalFilename == null || !_originalFilename.contains(".")) {
            return ".jpg";
        }
        return _originalFilename.substring(_originalFilename.lastIndexOf('.'));
    }
}
