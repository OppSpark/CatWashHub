CREATE TABLE IF NOT EXISTS users
(
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    email            VARCHAR(255)          NOT NULL UNIQUE,
    password         VARCHAR(255),
    nickname         VARCHAR(50)           NOT NULL,
    role             ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    provider         ENUM('LOCAL', 'GOOGLE')        DEFAULT 'LOCAL',
    provider_id      VARCHAR(255),
    agreed_terms     BOOLEAN               NOT NULL DEFAULT FALSE,
    agreed_privacy   BOOLEAN               NOT NULL DEFAULT FALSE,
    agreed_marketing BOOLEAN                        DEFAULT FALSE,
    is_deleted       BOOLEAN               NOT NULL DEFAULT FALSE,
    created_at       DATETIME              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME              NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at       DATETIME
);

CREATE TABLE IF NOT EXISTS categories
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE,
    sort_order INT         NOT NULL DEFAULT 0,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,
    category_id BIGINT,
    name        VARCHAR(100)             NOT NULL,
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

CREATE TABLE IF NOT EXISTS dilution_ratios
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id  BIGINT      NOT NULL,
    label       VARCHAR(50) NOT NULL,
    ratio       INT         NOT NULL,
    description TEXT,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites
(
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT   NOT NULL,
    product_id        BIGINT   NOT NULL,
    dilution_ratio_id BIGINT,
    custom_ratio      INT,
    nickname          VARCHAR(100),
    sort_order        INT      NOT NULL DEFAULT 0,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (dilution_ratio_id) REFERENCES dilution_ratios (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS calculation_histories
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT        NOT NULL,
    product_id BIGINT,
    ratio      INT           NOT NULL,
    water_ml   DECIMAL(6, 1) NOT NULL,
    product_ml DECIMAL(6, 1) NOT NULL,
    memo       VARCHAR(255),
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS product_reviews
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT  NOT NULL,
    product_id BIGINT  NOT NULL,
    rating     TINYINT NOT NULL,
    content    TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_sets
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT      NOT NULL,
    name       VARCHAR(50) NOT NULL,
    is_default BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_set_items
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    set_id     BIGINT  NOT NULL,
    product_id BIGINT,
    custom_name VARCHAR(100),
    category   VARCHAR(100),
    sort_order INT     NOT NULL DEFAULT 0,
    FOREIGN KEY (set_id) REFERENCES product_sets (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS wash_sessions
(
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT                        NOT NULL,
    status           ENUM('PREPARING', 'DONE')     NOT NULL DEFAULT 'PREPARING',
    washed_at        DATE                          NOT NULL,
    location         VARCHAR(100),
    weather          ENUM('SUNNY', 'CLOUDY', 'RAINY', 'SNOWY'),
    duration_minutes INT,
    cost             INT,
    rating           INT,
    memo             TEXT,
    created_at       DATETIME                      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wash_products
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id  BIGINT  NOT NULL,
    product_id  BIGINT,
    custom_name VARCHAR(100),
    category    VARCHAR(100),
    memo        VARCHAR(200),
    sort_order  INT     NOT NULL DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES wash_sessions (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS wash_photos
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id  BIGINT                       NOT NULL,
    photo_url   VARCHAR(500)                 NOT NULL,
    photo_type  ENUM('BEFORE', 'AFTER', 'ETC') NOT NULL,
    created_at  DATETIME                     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES wash_sessions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    title      VARCHAR(200) NOT NULL,
    content    TEXT         NOT NULL,
    view_count INT          NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_images
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id    BIGINT       NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    sort_order INT          NOT NULL DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_likes
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id    BIGINT   NOT NULL,
    user_id    BIGINT   NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_post_likes (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id    BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    parent_id  BIGINT,
    content    TEXT   NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recipes
(
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT        NOT NULL,
    title             VARCHAR(100)  NOT NULL,
    description       TEXT,
    car_model         VARCHAR(100),
    estimated_minutes INT,
    visibility        ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    save_count        INT           NOT NULL DEFAULT 0,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recipe_steps
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id   BIGINT      NOT NULL,
    step_order  INT         NOT NULL,
    step_type   ENUM(
        'PRE_RINSE',
        'PRE_WASH',
        'WHEEL',
        'MAIN_WASH',
        'IRON_REMOVE',
        'CLAY',
        'DRY',
        'GLASS',
        'COATING',
        'TIRE_DRESSING',
        'INTERIOR',
        'OTHER'
    )           NOT NULL DEFAULT 'OTHER',
    custom_label VARCHAR(50),
    product_id  BIGINT,
    ratio       INT,
    memo        VARCHAR(255),
    FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS recipe_saves
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT   NOT NULL,
    recipe_id  BIGINT   NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_recipe_saves (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
);
