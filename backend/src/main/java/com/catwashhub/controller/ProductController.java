package com.catwashhub.controller;

import com.catwashhub.common.ApiResponse;
import com.catwashhub.dto.request.CalculationRequest;
import com.catwashhub.dto.request.ProductRequest;
import com.catwashhub.dto.request.ProductReviewRequest;
import com.catwashhub.dto.response.CalculationResponse;
import com.catwashhub.dto.response.CategoryResponse;
import com.catwashhub.dto.response.ProductResponse;
import com.catwashhub.dto.response.ProductReviewResponse;
import com.catwashhub.dto.response.ProductReviewSummaryResponse;
import com.catwashhub.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService m_ProductService;

    // ==================== 카테고리 ====================
    @GetMapping("/categories")
    public ApiResponse<List<CategoryResponse>> getCategories() {
        return ApiResponse.ok(m_ProductService.getCategories());
    }

    @PostMapping("/admin/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CategoryResponse> createCategory(@RequestParam String name) {
        return ApiResponse.ok(m_ProductService.createCategory(name));
    }

    // ==================== 제품 ====================
    @GetMapping("/products")
    public ApiResponse<List<ProductResponse>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String keyword) {
        return ApiResponse.ok(m_ProductService.getProducts(categoryId, brand, keyword));
    }

    @GetMapping("/products/{productId}")
    public ApiResponse<ProductResponse> getProduct(@PathVariable Long productId) {
        return ApiResponse.ok(m_ProductService.getProduct(productId));
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProductResponse> createProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid ProductRequest request) {
        return ApiResponse.ok(m_ProductService.createProduct(userDetails.getUsername(), request));
    }

    // ==================== 리뷰 ====================

    @GetMapping("/products/{productId}/reviews")
    public ApiResponse<ProductReviewSummaryResponse> getReviews(@PathVariable Long productId) {
        return ApiResponse.ok(m_ProductService.getReviews(productId));
    }

    @PostMapping("/products/{productId}/reviews")
    public ApiResponse<ProductReviewResponse> createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @RequestBody ProductReviewRequest request) {
        return ApiResponse.ok(m_ProductService.createReview(userDetails.getUsername(), productId, request));
    }

    @DeleteMapping("/products/reviews/{reviewId}")
    public ApiResponse<Void> deleteReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reviewId) {
        m_ProductService.deleteReview(userDetails.getUsername(), reviewId);
        return ApiResponse.ok();
    }

    // ==================== 희석 계산 ====================
    @PostMapping("/calculator")
    public ApiResponse<CalculationResponse> calculate(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid CalculationRequest request) {
        return ApiResponse.ok(m_ProductService.calculate(userDetails.getUsername(), request));
    }

    @GetMapping("/calculator/history")
    public ApiResponse<List<CalculationResponse>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(m_ProductService.getHistory(userDetails.getUsername()));
    }
}
