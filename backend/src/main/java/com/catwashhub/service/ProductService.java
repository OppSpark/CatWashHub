package com.catwashhub.service;

import com.catwashhub.domain.*;
import com.catwashhub.dto.request.CalculationRequest;
import com.catwashhub.dto.request.ProductRequest;
import com.catwashhub.dto.request.ProductReviewRequest;
import com.catwashhub.dto.response.CalculationResponse;
import com.catwashhub.dto.response.CategoryResponse;
import com.catwashhub.dto.response.ProductResponse;
import com.catwashhub.dto.response.ProductReviewResponse;
import com.catwashhub.dto.response.ProductReviewSummaryResponse;
import com.catwashhub.repository.ProductReviewRepository;
import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import com.catwashhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository m_ProductRepository;
    private final CategoryRepository m_CategoryRepository;
    private final UserRepository m_UserRepository;
    private final CalculationHistoryRepository m_HistoryRepository;
    private final ProductReviewRepository m_ReviewRepository;

    // ==================== 카테고리 ====================
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        return m_CategoryRepository.findAllByOrderBySortOrderAsc()
                .stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(String _name) {
        if (m_CategoryRepository.existsByName(_name)) {
            throw new CustomException(ErrorCode.CATEGORY_ALREADY_EXISTS);
        }
        Category category = Category.builder().name(_name).build();
        return CategoryResponse.from(m_CategoryRepository.save(category));
    }

    // ==================== 제품 ====================
    @Transactional(readOnly = true)
    public List<ProductResponse> getProducts(Long _categoryId, String _brand, String _keyword) {
        return m_ProductRepository.findPublicProducts(_categoryId, _brand, _keyword)
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProduct(Long _productId) {
        Product product = m_ProductRepository.findById(_productId)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse createProduct(String _email, ProductRequest _request) {
        User user = m_UserRepository.findByEmail(_email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Category category = null;
        if (_request.categoryId() != null) {
            category = m_CategoryRepository.findById(_request.categoryId())
                    .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND));
        }

        Product.Visibility visibility = Product.Visibility.PUBLIC;
        if ("PRIVATE".equals(_request.visibility())) {
            visibility = Product.Visibility.PRIVATE;
        }

        Product product = Product.builder()
                .user(user)
                .category(category)
                .name(_request.name())
                .brand(_request.brand())
                .description(_request.description())
                .price(_request.price())
                .capacityMl(_request.capacityMl())
                .visibility(visibility)
                .build();

        return ProductResponse.from(m_ProductRepository.save(product));
    }

    // ==================== 희석 계산 ====================
    @Transactional
    public CalculationResponse calculate(String _email, CalculationRequest _request) {
        User user = m_UserRepository.findByEmail(_email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Product product = null;
        String productName = "직접입력";
        if (_request.productId() != null) {
            product = m_ProductRepository.findById(_request.productId())
                    .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
            productName = product.getName();
        }

        // 약품량 계산: 물(ml) / 희석비
        BigDecimal productMl = _request.waterMl()
                .divide(BigDecimal.valueOf(_request.ratio()), 1, RoundingMode.HALF_UP);

        CalculationHistory history = CalculationHistory.builder()
                .user(user)
                .product(product)
                .ratio(_request.ratio())
                .waterMl(_request.waterMl())
                .productMl(productMl)
                .memo(_request.memo())
                .build();
        m_HistoryRepository.save(history);

        return new CalculationResponse(
                product != null ? product.getId() : null,
                productName,
                _request.ratio(),
                _request.waterMl(),
                productMl,
                _request.memo()
        );
    }

    // ==================== 리뷰 ====================

    @Transactional(readOnly = true)
    public ProductReviewSummaryResponse getReviews(Long _productId) {
        try {
            List<ProductReviewResponse> reviews = m_ReviewRepository
                    .findByProductIdOrderByCreatedAtDesc(_productId)
                    .stream()
                    .map(ProductReviewResponse::from)
                    .toList();
            Double avg = m_ReviewRepository.findAverageRatingByProductId(_productId);
            return new ProductReviewSummaryResponse(avg, reviews.size(), reviews);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public ProductReviewResponse createReview(String _email, Long _productId, ProductReviewRequest _req) {
        try {
            if (_req.rating() == null || _req.rating() < 1 || _req.rating() > 5) {
                throw new CustomException(ErrorCode.INVALID_INPUT);
            }
            User user = m_UserRepository.findByEmail(_email)
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
            Product product = m_ProductRepository.findById(_productId)
                    .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));

            // 이미 리뷰 작성한 경우 수정으로 처리
            ProductReview review = m_ReviewRepository.findByProductIdAndUserId(_productId, user.getId())
                    .orElse(null);
            if (review != null) {
                review.update(_req.rating(), _req.content());
            } else {
                review = ProductReview.builder()
                        .user(user)
                        .product(product)
                        .rating(_req.rating())
                        .content(_req.content())
                        .build();
            }
            return ProductReviewResponse.from(m_ReviewRepository.save(review));
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public void deleteReview(String _email, Long _reviewId) {
        try {
            User user = m_UserRepository.findByEmail(_email)
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
            ProductReview review = m_ReviewRepository.findById(_reviewId)
                    .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));
            if (!review.getUser().getId().equals(user.getId())) {
                throw new CustomException(ErrorCode.FORBIDDEN);
            }
            m_ReviewRepository.delete(review);
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public List<CalculationResponse> getHistory(String _email) {
        User user = m_UserRepository.findByEmail(_email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return m_HistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(h -> new CalculationResponse(
                        h.getProduct() != null ? h.getProduct().getId() : null,
                        h.getProduct() != null ? h.getProduct().getName() : "직접입력",
                        h.getRatio(),
                        h.getWaterMl(),
                        h.getProductMl(),
                        h.getMemo()
                ))
                .toList();
    }
}
