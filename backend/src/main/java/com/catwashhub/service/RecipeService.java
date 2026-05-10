package com.catwashhub.service;

import com.catwashhub.domain.*;
import com.catwashhub.dto.request.RecipeRequest;
import com.catwashhub.dto.response.RecipeResponse;
import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import com.catwashhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository m_RecipeRepository;
    private final RecipeSaveRepository m_RecipeSaveRepository;
    private final UserRepository m_UserRepository;
    private final ProductRepository m_ProductRepository;

    // ==================== 조회 ====================
    @Transactional(readOnly = true)
    public Page<RecipeResponse> getRecipes(String _keyword, String _carModel,
                                            int _page, int _size, String _email) {
        Page<Recipe> recipes = m_RecipeRepository.findPublicRecipes(
                _keyword, _carModel, PageRequest.of(_page, _size));

        return recipes.map(r -> RecipeResponse.from(r, isSaved(r.getId(), _email)));
    }

    @Transactional(readOnly = true)
    public List<RecipeResponse> getTopRecipes(String _email) {
        return m_RecipeRepository.findTopRecipes(PageRequest.of(0, 10))
                .stream()
                .map(r -> RecipeResponse.from(r, isSaved(r.getId(), _email)))
                .toList();
    }

    @Transactional(readOnly = true)
    public RecipeResponse getRecipe(Long _recipeId, String _email) {
        Recipe recipe = findRecipeById(_recipeId);
        return RecipeResponse.from(recipe, isSaved(_recipeId, _email));
    }

    @Transactional(readOnly = true)
    public List<RecipeResponse> getMyRecipes(String _email) {
        User user = findUserByEmail(_email);
        return m_RecipeRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(r -> RecipeResponse.from(r, isSaved(r.getId(), _email)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RecipeResponse> getSavedRecipes(String _email) {
        User user = findUserByEmail(_email);
        return m_RecipeSaveRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(rs -> RecipeResponse.from(rs.getRecipe(), true))
                .toList();
    }

    // ==================== 생성/수정/삭제 ====================
    @Transactional
    public RecipeResponse createRecipe(String _email, RecipeRequest _request) {
        User user = findUserByEmail(_email);

        Recipe.Visibility visibility = "PRIVATE".equals(_request.visibility())
                ? Recipe.Visibility.PRIVATE : Recipe.Visibility.PUBLIC;

        Recipe recipe = Recipe.builder()
                .user(user)
                .title(_request.title())
                .description(_request.description())
                .carModel(_request.carModel())
                .estimatedMinutes(_request.estimatedMinutes())
                .visibility(visibility)
                .build();

        addSteps(recipe, _request.steps());
        return RecipeResponse.from(m_RecipeRepository.save(recipe), false);
    }

    @Transactional
    public RecipeResponse updateRecipe(Long _recipeId, String _email, RecipeRequest _request) {
        Recipe recipe = findRecipeById(_recipeId);
        User user = findUserByEmail(_email);

        if (!recipe.isOwner(user.getId())) {
            throw new CustomException(ErrorCode.RECIPE_FORBIDDEN);
        }

        Recipe.Visibility visibility = "PRIVATE".equals(_request.visibility())
                ? Recipe.Visibility.PRIVATE : Recipe.Visibility.PUBLIC;

        recipe.update(_request.title(), _request.description(), _request.carModel(),
                _request.estimatedMinutes(), visibility);

        recipe.getSteps().clear();
        addSteps(recipe, _request.steps());

        return RecipeResponse.from(recipe, isSaved(_recipeId, _email));
    }

    @Transactional
    public void deleteRecipe(Long _recipeId, String _email) {
        Recipe recipe = findRecipeById(_recipeId);
        User user = findUserByEmail(_email);

        if (!recipe.isOwner(user.getId())) {
            throw new CustomException(ErrorCode.RECIPE_FORBIDDEN);
        }

        m_RecipeRepository.delete(recipe);
    }

    // ==================== 저장(북마크) ====================
    @Transactional
    public boolean toggleSave(Long _recipeId, String _email) {
        User user = findUserByEmail(_email);
        Recipe recipe = findRecipeById(_recipeId);

        if (m_RecipeSaveRepository.existsByUserIdAndRecipeId(user.getId(), _recipeId)) {
            m_RecipeSaveRepository.findByUserIdAndRecipeId(user.getId(), _recipeId)
                    .ifPresent(m_RecipeSaveRepository::delete);
            recipe.decrementSaveCount();
            return false;
        }

        RecipeSave save = RecipeSave.builder().user(user).recipe(recipe).build();
        m_RecipeSaveRepository.save(save);
        recipe.incrementSaveCount();
        return true;
    }

    // ==================== 내부 유틸 ====================
    private void addSteps(Recipe _recipe, List<RecipeRequest.RecipeStepRequest> _stepRequests) {
        for (int i = 0; i < _stepRequests.size(); i++) {
            RecipeRequest.RecipeStepRequest stepReq = _stepRequests.get(i);

            Product product = null;
            if (stepReq.productId() != null) {
                product = m_ProductRepository.findById(stepReq.productId())
                        .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
            }

            RecipeStep step = RecipeStep.builder()
                    .recipe(_recipe)
                    .stepOrder(stepReq.stepOrder() != null ? stepReq.stepOrder() : i + 1)
                    .stepType(stepReq.stepType() != null ? stepReq.stepType() : RecipeStep.StepType.OTHER)
                    .customLabel(stepReq.customLabel())
                    .product(product)
                    .ratio(stepReq.ratio())
                    .memo(stepReq.memo())
                    .build();

            _recipe.getSteps().add(step);
        }
    }

    private boolean isSaved(Long _recipeId, String _email) {
        if (_email == null) {
            return false;
        }
        return m_UserRepository.findByEmail(_email)
                .map(u -> m_RecipeSaveRepository.existsByUserIdAndRecipeId(u.getId(), _recipeId))
                .orElse(false);
    }

    private Recipe findRecipeById(Long _recipeId) {
        return m_RecipeRepository.findById(_recipeId)
                .orElseThrow(() -> new CustomException(ErrorCode.RECIPE_NOT_FOUND));
    }

    private User findUserByEmail(String _email) {
        return m_UserRepository.findByEmail(_email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
