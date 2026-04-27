-- 카테고리 더미 데이터
INSERT INTO categories (name, sort_order) VALUES ('세차 샴푸', 1);
INSERT INTO categories (name, sort_order) VALUES ('휠 클리너', 2);
INSERT INTO categories (name, sort_order) VALUES ('유리 세정제', 3);
INSERT INTO categories (name, sort_order) VALUES ('왁스/코팅제', 4);
INSERT INTO categories (name, sort_order) VALUES ('타이어 드레싱', 5);
INSERT INTO categories (name, sort_order) VALUES ('철분 제거제', 6);
INSERT INTO categories (name, sort_order) VALUES ('기타', 7);

-- 제품 더미 데이터 (user_id NULL = 관리자 등록)
INSERT INTO products (user_id, category_id, name, brand, description, price, capacity_ml, visibility)
VALUES (NULL, 1, '머구스 카 샴푸', '머구스', '고농축 중성 세차 샴푸. 차량 도장면에 안전하며 풍부한 거품으로 오염을 효과적으로 제거합니다.', 18000, 500.0, 'PUBLIC');

INSERT INTO products (user_id, category_id, name, brand, description, price, capacity_ml, visibility)
VALUES (NULL, 1, '소너스 오토 샴푸', '소너스', 'pH 중성 고농축 카 샴푸. 왁스 및 코팅 보호막을 유지하면서 세정력이 뛰어납니다.', 22000, 473.0, 'PUBLIC');

INSERT INTO products (user_id, category_id, name, brand, description, price, capacity_ml, visibility)
VALUES (NULL, 1, '맥과이어스 골드 클래스 샴푸', '맥과이어스', '카나우바 왁스 성분이 함유된 프리미엄 카 샴푸. 세정과 동시에 광택을 부여합니다.', 15000, 473.0, 'PUBLIC');

INSERT INTO products (user_id, category_id, name, brand, description, price, capacity_ml, visibility)
VALUES (NULL, 2, '악렉스 휠 클리너', '악렉스', '철분 반응형 휠 클리너. 보라색으로 변하며 철분 오염을 강력하게 제거합니다.', 25000, 500.0, 'PUBLIC');

INSERT INTO products (user_id, category_id, name, brand, description, price, capacity_ml, visibility)
VALUES (NULL, 2, '소너스 폴리시 휠 클리너', '소너스', '산성 베이스 휠 클리너. 브레이크 더스트와 도로 오염을 효과적으로 제거합니다.', 19000, 473.0, 'PUBLIC');

INSERT INTO products (user_id, category_id, name, brand, description, price, capacity_ml, visibility)
VALUES (NULL, 3, '스타머 유리 클리너', '스타머', '발수 성분이 포함된 유리 세정제. 유막 제거 및 발수 코팅 효과를 동시에 제공합니다.', 12000, 500.0, 'PUBLIC');

INSERT INTO products (user_id, category_id, name, brand, description, price, capacity_ml, visibility)
VALUES (NULL, 4, '머구스 하이드로 스프레이 왁스', '머구스', '스프레이 타입 왁스. 빠른 도포와 높은 광택을 자랑하며 방수 효과가 뛰어납니다.', 32000, 500.0, 'PUBLIC');

INSERT INTO products (user_id, category_id, name, brand, description, price, capacity_ml, visibility)
VALUES (NULL, 6, '악렉스 아이런 아웃', '악렉스', '철분 반응형 제거제. 도장면, 휠, 유리에 사용 가능하며 강력한 철분 오염 제거력을 가집니다.', 28000, 500.0, 'PUBLIC');

INSERT INTO products (user_id, category_id, name, brand, description, price, capacity_ml, visibility)
VALUES (NULL, 5, '악렉스 타이어 젤', '악렉스', '물 타입 타이어 드레싱. 번들거림 없는 자연스러운 광택과 오래 지속되는 보호막을 형성합니다.', 20000, 500.0, 'PUBLIC');

-- 희석비 더미 데이터
-- 머구스 카 샴푸 (product_id = 1)
INSERT INTO dilution_ratios (product_id, label, ratio, description) VALUES (1, '일반 세차', 500, '일반적인 세차 시 권장 희석비');
INSERT INTO dilution_ratios (product_id, label, ratio, description) VALUES (1, '심한 오염', 200, '심한 오염 제거 시 권장 희석비');
INSERT INTO dilution_ratios (product_id, label, ratio, description) VALUES (1, '예비 세척', 100, '고압 세척 전 예비 세척용');

-- 소너스 오토 샴푸 (product_id = 2)
INSERT INTO dilution_ratios (product_id, label, ratio, description) VALUES (2, '일반 세차', 800, '일반적인 세차 시 권장 희석비');
INSERT INTO dilution_ratios (product_id, label, ratio, description) VALUES (2, '심한 오염', 300, '심한 오염 제거 시 권장 희석비');

-- 맥과이어스 골드 클래스 샴푸 (product_id = 3)
INSERT INTO dilution_ratios (product_id, label, ratio, description) VALUES (3, '일반 세차', 400, '일반적인 세차 시 권장 희석비');
INSERT INTO dilution_ratios (product_id, label, ratio, description) VALUES (3, '폼건 사용', 100, '폼건 사용 시 권장 희석비');

-- 악렉스 휠 클리너 (product_id = 4)
INSERT INTO dilution_ratios (product_id, label, ratio, description) VALUES (4, '원액 사용', 1, '심한 오염 시 원액 그대로 사용');
INSERT INTO dilution_ratios (product_id, label, ratio, description) VALUES (4, '일반 사용', 3, '일반적인 휠 세정 시 희석비');

-- 소너스 폴리시 휠 클리너 (product_id = 5)
INSERT INTO dilution_ratios (product_id, label, ratio, description) VALUES (5, '일반 사용', 5, '일반적인 휠 세정 시 희석비');
INSERT INTO dilution_ratios (product_id, label, ratio, description) VALUES (5, '심한 오염', 2, '심한 브레이크 더스트 제거 시');
