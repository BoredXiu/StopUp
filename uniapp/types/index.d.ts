export interface User {
	id: number;
	phone: string;
	nickname: string;
	avatar: string;
	bio: string;
	gender: number;
	city: string;
	creditScore: number;
	role: number;
	status: number;
	createdAt: string;
	updatedAt: string;
}

export interface Sport {
	id: number;
	name: string;
	icon: string;
	status: number;
}

export interface Venue {
	id: number;
	name: string;
	address: string;
	city: string;
	district: string;
	latitude: number;
	longitude: number;
	phone: string;
	businessHours: string;
	description: string;
	facilities: string[];
	coverImage: string;
	rating: number;
	matchCount: number;
	isHot: number;
	status: number;
	images?: { id: number; url: string; sortOrder: number }[];
}

export interface Match {
	id: number;
	title: string;
	sportId: number;
	sportName: string;
	sportIcon: string;
	venueId: number | null;
	venueName: string;
	venueAddress: string;
	venueCity: string;
	creatorId: number;
	creatorNickname: string;
	creatorAvatar: string;
	matchDate: string;
	startTime: string;
	endTime: string;
	maxPlayers: number;
	minPlayers: number;
	currentPlayers: number;
	feeType: number;
	totalFee: number;
	perPersonFee: number;
	levelRequired: number;
	genderRequired: number;
	description: string;
	coverImage: string;
	status: number;
	cancelReason: string;
	isFeatured: number;
	viewCount: number;
	createdAt: string;
	updatedAt: string;
	members?: MatchMember[];
	isMember?: boolean;
}

export interface MatchMember {
	id: number;
	userId: number;
	nickname: string;
	avatar: string;
	creditScore: number;
	role: number;
	status: number;
	joinedAt: string;
}

export interface Order {
	id: number;
	orderNo: string;
	matchId: number;
	matchTitle: string;
	sportName: string;
	venueName: string;
	matchDate: string;
	startTime: string;
	endTime: string;
	amount: number;
	status: number;
	paidAt: string | null;
	refundedAt: string | null;
	createdAt: string;
}

export interface Notification {
	id: number;
	type: string;
	title: string;
	content: string;
	relatedId: number | null;
	relatedType: string | null;
	isRead: number;
	createdAt: string;
}

export interface CreditLog {
	id: number;
	reason: string;
	changeAmount: number;
	balanceAfter: number;
	createdAt: string;
}

export interface ApiResponse<T = any> {
	code: number;
	message: string;
	data: T;
}

export interface PaginatedData<T> {
	list: T[];
	total: number;
	page: number;
	pageSize: number;
}

export interface LoginResult {
	accessToken: string;
	refreshToken: string;
	user: User;
}

export interface CaptchaData {
	captchaId: string;
	image: string;
}
