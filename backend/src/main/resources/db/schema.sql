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
