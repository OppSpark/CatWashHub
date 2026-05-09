package com.catwashhub.service;

import com.catwashhub.domain.*;
import com.catwashhub.dto.request.ProductSetRequest;
import com.catwashhub.dto.response.ProductSetResponse;
import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import com.catwashhub.repository.ProductRepository;
import com.catwashhub.repository.ProductSetRepository;
import com.catwashhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductSetService {

    private final ProductSetRepository m_ProductSetRepository;
    private final ProductRepository m_ProductRepository;
    private final UserRepository m_UserRepository;

    // ==================== 용품 세트 CRUD ====================

    @Transactional(readOnly = true)
    public List<ProductSetResponse> getSets(String _email) {
        User user = getUser(_email);
        return m_ProductSetRepository.findByUserIdOrderByIsDefaultDescCreatedAtAsc(user.getId())
                .stream()
                .map(ProductSetResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductSetResponse getSet(String _email, Long _setId) {
        User user = getUser(_email);
        ProductSet set = m_ProductSetRepository.findByIdAndUserId(_setId, user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_SET_NOT_FOUND));
        return ProductSetResponse.from(set);
    }

    @Transactional
    public ProductSetResponse createSet(String _email, ProductSetRequest _request) {
        User user = getUser(_email);

        ProductSet set = ProductSet.builder()
                .user(user)
                .name(_request.name())
                .isDefault(_request.isDefault())
                .build();

        addItems(set, _request.items());
        m_ProductSetRepository.save(set);

        return ProductSetResponse.from(set);
    }

    @Transactional
    public ProductSetResponse updateSet(String _email, Long _setId, ProductSetRequest _request) {
        User user = getUser(_email);
        ProductSet set = m_ProductSetRepository.findByIdAndUserId(_setId, user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_SET_NOT_FOUND));

        set.update(_request.name(), _request.isDefault());
        set.getItems().clear();
        addItems(set, _request.items());

        return ProductSetResponse.from(set);
    }

    @Transactional
    public void deleteSet(String _email, Long _setId) {
        User user = getUser(_email);
        ProductSet set = m_ProductSetRepository.findByIdAndUserId(_setId, user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_SET_NOT_FOUND));
        m_ProductSetRepository.delete(set);
    }

    // ==================== 초기화 함수 ====================

    private void addItems(ProductSet _set, List<ProductSetRequest.ProductSetItemRequest> _items) {
        if (_items == null) {
            return;
        }

        for (ProductSetRequest.ProductSetItemRequest req : _items) {
            Product product = null;
            if (req.productId() != null) {
                product = m_ProductRepository.findById(req.productId())
                        .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
            }

            ProductSetItem item = ProductSetItem.builder()
                    .productSet(_set)
                    .product(product)
                    .customName(req.customName())
                    .category(req.category())
                    .sortOrder(req.sortOrder())
                    .build();

            _set.getItems().add(item);
        }
    }

    private User getUser(String _email) {
        return m_UserRepository.findByEmail(_email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
