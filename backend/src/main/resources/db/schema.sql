CREATE TABLE users
(
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password         VARCHAR(255),
    nickname         VARCHAR(50)  NOT NULL,
    role             ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    provider         ENUM('LOCAL', 'GOOGLE')        DEFAULT 'LOCAL',
    provider_id      VARCHAR(255),
    agreed_terms     BOOLEAN      NOT NULL DEFAULT FALSE,
    agreed_privacy   BOOLEAN      NOT NULL DEFAULT FALSE,
    agreed_marketing BOOLEAN               DEFAULT FALSE,
    is_deleted       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at       DATETIME
);

CREATE TABLE categories
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE,
    sort_order INT         NOT NULL DEFAULT 0,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,
    category_id BIGINT,
    name        VARCHAR(100)  NOT NULL,
    brand       VARCHAR(100),
    description TEXT,
    price       INT,
    capacity_ml DECIMAL(6, 1),
    image_url   VARCHAR(500),
    visibility  ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    created_at  DATETIME                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME                  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

CREATE TABLE dilution_ratios
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id  BIGINT       NOT NULL,
    label       VARCHAR(50)  NOT NULL,
    ratio       INT          NOT NULL,
    description TEXT,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE TABLE favorites
(
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT NOT NULL,
    product_id        BIGINT NOT NULL,
    dilution_ratio_id BIGINT,
    custom_ratio      INT,
    nickname          VARCHAR(100),
    sort_order        INT    NOT NULL DEFAULT 0,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (dilution_ratio_id) REFERENCES dilution_ratios (id) ON DELETE SET NULL
);

CREATE TABLE calculation_histories
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT         NOT NULL,
    product_id  BIGINT,
    ratio       INT            NOT NULL,
    water_ml    DECIMAL(6, 1)  NOT NULL,
    product_ml  DECIMAL(6, 1)  NOT NULL,
    memo        VARCHAR(255),
    created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
);

CREATE TABLE product_reviews
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT   NOT NULL,
    product_id BIGINT   NOT NULL,
    rating     TINYINT  NOT NULL,
    content    TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
