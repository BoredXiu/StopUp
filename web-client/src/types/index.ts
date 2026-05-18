export interface User {
  id: number
  nickname: string
  avatar: string | null
  phone: string | null
  gender: number
  birthday: string | null
  bio: string
  city: string | null
  creditScore: number
  sportTags: SportTag[]
  createdAt: string
}

export interface SportTag {
  id: number
  sportId: number
  sportName: string
  level: number
}

export interface Sport {
  id: number
  name: string
  icon: string | null
  sortOrder: number
}

export interface Match {
  id: number
  title: string
  sportId: number
  sportName: string
  sportIcon: string | null
  venueId: number | null
  venueName: string | null
  venueAddress: string | null
  latitude: number | null
  longitude: number | null
  creatorId: number
  creatorNickname: string
  creatorAvatar: string | null
  matchDate: string
  startTime: string
  endTime: string
  maxPlayers: number
  minPlayers: number
  currentPlayers: number
  feeType: number
  totalFee: number
  perPersonFee: number
  levelRequired: number
  genderRequired: number
  description: string
  coverImage: string | null
  status: number
  isFeatured: number
  viewCount: number
  members?: MatchMember[]
  isMember?: boolean
  createdAt: string
}

export interface MatchMember {
  id: number
  matchId: number
  userId: number
  nickname: string
  avatar: string | null
  gender: number
  creditScore: number
  role: number
  status: number
  joinedAt: string
}

export interface Venue {
  id: number
  name: string
  address: string
  city: string
  district: string | null
  latitude: number
  longitude: number
  phone: string | null
  businessHours: string | null
  description: string | null
  facilities: string[]
  coverImage: string | null
  rating: number
  matchCount: number
  isHot: number
  images: VenueImage[]
}

export interface VenueImage {
  id: number
  url: string
  sortOrder: number
}

export interface Order {
  id: number
  orderNo: string
  userId: number
  matchId: number
  matchTitle: string
  matchDate: string
  sportName: string
  amount: number
  status: number
  paidAt: string | null
  refundAt: string | null
  refundAmount: number | null
  expireAt: string | null
  remark: string | null
  createdAt: string
}

export interface Notification {
  id: number
  userId: number
  type: string
  title: string
  content: string
  relatedId: number | null
  relatedType: string | null
  isRead: number
  readAt: string | null
  createdAt: string
}

export interface CreditLog {
  id: number
  userId: number
  changeAmount: number
  balance: number
  reason: string
  relatedId: number | null
  relatedType: string | null
  createdAt: string
}

export interface PaginatedResult<T> {
  list: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export const MatchStatusMap: Record<number, string> = {
  1: '报名中',
  2: '已满员',
  3: '已开始',
  4: '已结束',
  5: '已取消',
}

export const MatchStatusColorMap: Record<number, string> = {
  1: '#67C23A',
  2: '#E6A23C',
  3: '#409EFF',
  4: '#909399',
  5: '#F56C6C',
}

export const FeeTypeMap: Record<number, string> = {
  1: 'AA制',
  2: '固定费用',
  3: '免费',
}

export const LevelMap: Record<number, string> = {
  0: '不限',
  1: '入门',
  2: '初级',
  3: '中级',
  4: '高级',
  5: '专业',
}

export const GenderRequireMap: Record<number, string> = {
  0: '不限',
  1: '仅男生',
  2: '仅女生',
}

export const OrderStatusMap: Record<number, string> = {
  1: '待支付',
  2: '已支付',
  3: '已取消',
  4: '已完成',
  5: '已退款',
}