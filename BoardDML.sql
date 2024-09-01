-- 회원가입
INSERT INTO user
VALUES ('admin@email.com', 'password', 'admin', '01012345678', '부산광역시 남구 대연동', '경성대 부경대역', NULL);

-- 로그인
SELECT * FROM user WHERE email = 'admin@email.com';

-- 게시물 작성
INSERT INTO board (title, content, write_datetime, favorite_count, comment_count, view_count, writer_email)
VALUES ('제목입니다', '내용입니다', '2024-08-03',0,0,0, 'admin@email.com');

INSERT INTO image VALUES (1, 'testURL');

-- 댓글 작성
INSERT INTO
comment (content, write_datetime, user_email, board_number)
VALUES ('반갑습니다/', '2024-08-03 21:30', 'admin@email.com', 1);

UPDATE board SET comment_count = comment_count + 1 WHERE board_number = 1;

-- 좋아요
INSERT INTO favorite VALUES('admin@email.com', 1);

UPDATE board SET favorite_count = favorite_count + 1 WHERE board_number = 1;

UPDATE board SET favorite_count = favorite_count - 1 WHERE board_number = 1;

DELETE FROM favorite
WHERE user_email = 'admin@email.com' AND board_number = 1;

-- 게시물 수정
UPDATE board SET title = '제목 수정하기', content = '내용 수정하기' WHERE board_number = 1;

DELETE FROM image WHERE board_number = 1;

INSERT INTO image
VALUES (1, 'testURL');

-- 게시물 삭제
DELETE FROM comment WHERE board_number = 1;

DELETE FROM favorite WHERE board_number = 1;

DELETE FROM board WHERE board_number = 2;

-- 상세 게시물 불러오기
SELECT
    B.board_number AS board_number,
    B.title AS title,
    B.content AS content,
    B.write_datetime AS write_datetime,
    B.writer_email AS writer_email,
    U.nickname AS nickname,
    U.profile_image AS prpfile_image
FROM board AS B
INNER JOIN user AS U
ON B.writer_email = U.email
WHERE board_number = 1;


SELECT image
FROM image
WHERE board_number = 1;

SELECT
    U.email AS email,
    U.nickname AS nickname,
    U.profile_image
FROM favorite AS F
INNER  JOIN  user AS U
ON F.user_email = U.email
WHERE F.board_number = 1;

SELECT
    U.nickname AS nicknamem,
    U.profile_image AS profile_image,
    C.write_datetime AS write_datetime,
    C.content AS content
FROM  comment AS C
INNER JOIN user AS U
ON C.user_email = U.email
WHERE C.board_number = 1
ORDER BY write_datetime DESC;

-- 최신게시물 리스트 불러오기
SELECT *
FROM board_list_view
ORDER BY write_datetime DESC
LIMIT  0, 5;

-- 검색어 리스트 불러오기
SELECT
    B.board_number AS board_number,
    B.title AS title,
    B.content AS content,
    I.image AS title_image,
    B.view_count AS view_count,
    B.favorite_count AS favorite_count,
    B.comment_count AS comment_count,
    B.write_datetime AS write_datetime,
    U.nickname AS writer_nickname,
    U.profile_image AS writer_profile_image
FROM board AS B
INNER JOIN user AS U
ON B.writer_email = U.email
LEFT JOIN (SELECT board_number, ANY_VALUE(image) AS image FROM image GROUP BY board_number) AS I
ON B.board_number = I.board_number
WHERE  title LIKE '%제목%' OR content LIKE '%제목%'
ORDER BY write_datetime DESC;

-- 검색어 주간 상위 게시물
SELECT
    B.board_number AS board_number,
    B.title AS title,
    B.content AS content,
    I.image AS title_image,
    B.view_count AS view_count,
    B.favorite_count AS favorite_count,
    B.comment_count AS comment_count,
    B.write_datetime AS write_datetime,
    U.nickname AS writer_nickname,
    U.profile_image AS writer_profile_image
FROM board AS B
INNER JOIN user AS U
ON B.writer_email = U.email
LEFT JOIN (SELECT board_number, ANY_VALUE(image) AS image FROM image GROUP BY board_number) AS I
ON B.board_number = I.board_number
WHERE B.write_datetime BETWEEN '2024-08-02' AND '2024-08-09'
ORDER BY favorite_count DESC, comment_count DESC;

-- 특정 유저 게시물 불러오기
SELECT
    B.board_number AS board_number,
    B.title AS title,
    B.content AS content,
    I.image AS title_image,
    B.view_count AS view_count,
    B.favorite_count AS favorite_count,
    B.comment_count AS comment_count,
    B.write_datetime AS write_datetime,
    U.nickname AS writer_nickname,
    U.profile_image AS writer_profile_image
FROM board AS B
INNER JOIN user AS U
ON B.writer_email = U.email
LEFT JOIN (SELECT board_number, ANY_VALUE(image) AS image FROM image GROUP BY board_number) AS I
ON B.board_number = I.board_number
WHERE  B.writer_email= 'admin@email.com'
ORDER BY write_datetime DESC;

-- 인기 검색어 리스트
SELECT search_word, count(search_word) AS count
FROM search_log
WHERE relation IS FALSE
GROUP BY search_word
ORDER BY count DESC
LIMIT 15;

-- 관련 검색어 리스트
SELECT relation_word, count(relation_word) AS count
FROM search_log
WHERE search_word = '검색어'
GROUP BY relation_word
ORDER BY count DESC
LIMIT 15;

-- 유저 정보 불러오기 / 로그인 정보 불러오기
SELECT *
FROM user
WHERE email = 'admin@email.com';

-- 닉네임 수정
UPDATE user SET nickname = '수정된 닉네임'
WHERE email = 'admin@email.com';


-- 프로필 이밎 수정
UPDATE user SET profile_image = '수정된 URL'
WHERE email = 'admin@email.com';
