package com.catwashhub.controller;

import com.catwashhub.common.ApiResponse;
import com.catwashhub.dto.request.RecipeRequest;
import com.catwashhub.dto.response.RecipeResponse;
import com.catwashhub.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService m_RecipeService;

    // ==================== 조회 ====================
    @GetMapping
    public ApiResponse<Page<RecipeResponse>> getRecipes(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String carModel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ApiResponse.ok(m_RecipeService.getRecipes(keyword, carModel, page, size, email));
    }

    @GetMapping("/top")
    public ApiResponse<List<RecipeResponse>> getTopRecipes(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ApiResponse.ok(m_RecipeService.getTopRecipes(email));
    }

    @GetMapping("/{recipeId}")
    public ApiResponse<RecipeResponse> getRecipe(
            @PathVariable Long recipeId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ApiResponse.ok(m_RecipeService.getRecipe(recipeId, email));
    }

    @GetMapping("/my")
    public ApiResponse<List<RecipeResponse>> getMyRecipes(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(m_RecipeService.getMyRecipes(userDetails.getUsername()));
    }

    @GetMapping("/saved")
    public ApiResponse<List<RecipeResponse>> getSavedRecipes(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(m_RecipeService.getSavedRecipes(userDetails.getUsername()));
    }

    // ==================== 생성/수정/삭제 ====================
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RecipeResponse> createRecipe(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid RecipeRequest request) {
        return ApiResponse.ok(m_RecipeService.createRecipe(userDetails.getUsername(), request));
    }

    @PatchMapping("/{recipeId}")
    public ApiResponse<RecipeResponse> updateRecipe(
            @PathVariable Long recipeId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid RecipeRequest request) {
        return ApiResponse.ok(m_RecipeService.updateRecipe(recipeId, userDetails.getUsername(), request));
    }

    @DeleteMapping("/{recipeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRecipe(
            @PathVariable Long recipeId,
            @AuthenticationPrincipal UserDetails userDetails) {
        m_RecipeService.deleteRecipe(recipeId, userDetails.getUsername());
    }

    // ==================== 저장(북마크) ====================
    @PostMapping("/{recipeId}/save")
    public ApiResponse<Boolean> toggleSave(
            @PathVariable Long recipeId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(m_RecipeService.toggleSave(recipeId, userDetails.getUsername()));
    }
}
