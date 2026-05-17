export type GatheringStatus = 'OPEN' | 'CLOSED'
export type ParticipantStatus = 'JOIN' | 'MAYBE' | 'CANCEL'

export interface UserCar {
  id: number
  carModel: string | null
  carColor: string | null
  plateNumber: string | null
}

export interface GatheringParticipant {
  userId: number
  nickname: string
  status: ParticipantStatus
  maskedPlate: string | null
  carModel: string | null
  carColor: string | null
}

export interface GatheringComment {
  id: number
  userId: number
  nickname: string
  content: string
  createdAt: string
}

export interface Gathering {
  id: number
  title: string
  description: string | null
  gatheringAt: string
  location: string
  locationDetail: string | null
  maxParticipants: number | null
  status: GatheringStatus
  hostId: number
  hostNickname: string
  hostMaskedPlate: string | null
  hostCarModel: string | null
  hostCarColor: string | null
  joinCount: number
  isBookmarked: boolean
  isParticipating: boolean
  myStatus: ParticipantStatus | null
  createdAt: string
  participants: GatheringParticipant[]
  comments: GatheringComment[]
}

export interface GatheringSummary {
  id: number
  title: string
  location: string
  gatheringAt: string
  status: GatheringStatus
  hostNickname: string
  joinCount: number
  maxParticipants: number | null
  isBookmarked: boolean
  createdAt: string
}

export interface GatheringRequest {
  title: string
  description: string | null
  gatheringAt: string
  location: string
  locationDetail: string | null
  maxParticipants: number | null
  showPlate: boolean
  plateDigits: number
  showCarInfo: boolean
}

export interface GatheringParticipantRequest {
  status: ParticipantStatus
  showPlate: boolean
  plateDigits: number
  showCarInfo: boolean
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  last: boolean
}
