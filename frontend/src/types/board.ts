export interface PostSummary {
  id: number
  authorId: number
  authorNickname: string
  title: string
  contentPreview: string
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: string
}

export interface Post {
  id: number
  authorId: number
  authorNickname: string
  title: string
  content: string
  viewCount: number
  likeCount: number
  likedByMe: boolean
  commentCount: number
  imageUrls: string[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  authorId: number
  authorNickname: string
  content: string
  createdAt: string
  replies: Comment[]
}

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
  last: boolean
}

export interface PostRequest {
  title: string
  content: string
}

export interface CommentRequest {
  parentId: number | null
  content: string
}
