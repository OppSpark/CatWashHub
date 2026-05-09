package com.catwashhub.controller;

import com.catwashhub.common.ApiResponse;
import com.catwashhub.dto.request.ProductSetRequest;
import com.catwashhub.dto.response.ProductSetResponse;
import com.catwashhub.service.ProductSetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-sets")
@RequiredArgsConstructor
public class ProductSetController {

    private final ProductSetService m_ProductSetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductSetResponse>>> getSets(
            @AuthenticationPrincipal UserDetails _userDetails) {
        List<ProductSetResponse> response = m_ProductSetService.getSets(_userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductSetResponse>> getSet(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id) {
        ProductSetResponse response = m_ProductSetService.getSet(_userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductSetResponse>> createSet(
            @AuthenticationPrincipal UserDetails _userDetails,
            @RequestBody ProductSetRequest _request) {
        ProductSetResponse response = m_ProductSetService.createSet(_userDetails.getUsername(), _request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductSetResponse>> updateSet(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id,
            @RequestBody ProductSetRequest _request) {
        ProductSetResponse response = m_ProductSetService.updateSet(_userDetails.getUsername(), id, _request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSet(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id) {
        m_ProductSetService.deleteSet(_userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
