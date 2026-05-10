package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recipe_steps")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecipeStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(nullable = false)
    private Integer stepOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StepType stepType;

    @Column(length = 50)
    private String customLabel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer ratio;

    @Column(length = 255)
    private String memo;

    @Builder
    public RecipeStep(Recipe recipe, Integer stepOrder, StepType stepType,
                      String customLabel, Product product, Integer ratio, String memo) {
        this.recipe = recipe;
        this.stepOrder = stepOrder;
        this.stepType = (stepType != null) ? stepType : StepType.OTHER;
        this.customLabel = customLabel;
        this.product = product;
        this.ratio = ratio;
        this.memo = memo;
    }

    public void updateOrder(Integer _stepOrder) {
        this.stepOrder = _stepOrder;
    }

    // step_type이 OTHER이고 customLabel이 있으면 customLabel 반환, 아니면 stepType 한국어명 반환
    public String getDisplayLabel() {
        if (this.stepType == StepType.OTHER && this.customLabel != null) {
            return this.customLabel;
        }
        return this.stepType.getLabel();
    }

    public enum StepType {
        PRE_RINSE("헹굼(프리)"),
        PRE_WASH("프리워시"),
        WHEEL("휠/타이어"),
        MAIN_WASH("본세차"),
        IRON_REMOVE("철분제거"),
        CLAY("점토세정"),
        DRY("건조"),
        GLASS("유리세정"),
        COATING("코팅/왁스"),
        TIRE_DRESSING("타이어 드레싱"),
        INTERIOR("실내청소"),
        OTHER("기타");

        private final String label;

        StepType(String label) {
            this.label = label;
        }

        public String getLabel() {
            return label;
        }
    }
}
