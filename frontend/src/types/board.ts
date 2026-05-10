export interface WashSessionEmbed {
  id: number
  washedAt: string
  location: string | null
  weather: string | null
  durationMinutes: number | null
  cost: number | null
  rating: number | null
  memo: string | null
  productNames: string[]
}

export interface PostSummary {
  id: number
  authorId: number
  authorNickname: string
  postType: 'FREE' | 'WASH_LOG'
  title: string
  contentPreview: string
  viewCount: number
  likeCount: number
  commentCount: number
  washSession: WashSessionEmbed | null
  createdAt: string
}

export interface Post {
  id: number
  authorId: number
  authorNickname: string
  postType: 'FREE' | 'WASH_LOG'
  title: string
  content: string
  viewCount: number
  likeCount: number
  likedByMe: boolean
  commentCount: number
  imageUrls: string[]
  washSession: WashSessionEmbed | null
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
  postType: 'FREE' | 'WASH_LOG'
  washSessionId?: number | null
  title: string
  content: string
}

export interface CommentRequest {
  parentId: number | null
  content: string
}
