import request from "./request";

export const authApi = {
	loginByPhone: (data: { phone: string; password: string; captchaId?: string; captchaCode?: string }) => request.post("/auth/login/phone", data),

	loginByWechat: (data: { code: string; userInfo?: any }) => request.post("/auth/login/wechat", data),

	register: (data: { phone: string; password: string; nickname?: string; smsCode: string }) => request.post("/auth/register", data),

	sendSms: (phone: string, captchaId?: string, captchaCode?: string) => request.post("/auth/send-sms", { phone, captchaId, captchaCode }),

	getCaptcha: () => request.get("/auth/captcha"),

	refreshToken: (refreshToken: string) => request.post("/auth/refresh", { refreshToken }),
};

export const userApi = {
	getProfile: () => request.get("/users/profile"),
	updateProfile: (data: any) => request.put("/users/profile", data),
	getUserDetail: (id: number) => request.get(`/users/${id}`),
	getCreditLogs: (params?: any) => request.get("/users/credit-logs", { params }),
	follow: (id: number) => request.post(`/users/${id}/follow`),
	unfollow: (id: number) => request.delete(`/users/${id}/follow`),
	getFollowers: (id: number, params?: any) => request.get(`/users/${id}/followers`, { params }),
	getFollowing: (id: number, params?: any) => request.get(`/users/${id}/following`, { params }),
	getFrequentPartners: (id: number) => request.get(`/users/${id}/partners`),
};

export const matchApi = {
	list: (params?: any) => request.get("/matches", { params }),
	detail: (id: number) => request.get(`/matches/${id}`),
	create: (data: any) => request.post("/matches", data),
	update: (id: number, data: any) => request.put(`/matches/${id}`, data),
	join: (id: number) => request.post(`/matches/${id}/join`),
	leave: (id: number) => request.post(`/matches/${id}/leave`),
	cancel: (id: number) => request.post(`/matches/${id}/cancel`),
	complete: (id: number) => request.post(`/matches/${id}/complete`),
	getMembers: (id: number) => request.get(`/matches/${id}/members`),
	myMatches: (params?: any) => request.get("/matches/my", { params }),
	favorite: (id: number) => request.post(`/matches/${id}/favorite`),
	unfavorite: (id: number) => request.delete(`/matches/${id}/favorite`),
	myFavorites: (params?: any) => request.get("/matches/favorites", { params }),
};

export const venueApi = {
	list: (params?: any) => request.get("/venues", { params }),
	detail: (id: number) => request.get(`/venues/${id}`),
	getHot: (limit?: number) => request.get("/venues/hot", { params: { limit } }),
};

export const orderApi = {
	create: (matchId: number) => request.post("/orders", { matchId }),
	pay: (id: number) => request.post(`/orders/${id}/pay`),
	refund: (id: number, reason?: string) => request.post(`/orders/${id}/refund`, { reason }),
	detail: (id: number) => request.get(`/orders/${id}`),
	myOrders: (params?: any) => request.get("/orders", { params }),
};

export const notificationApi = {
	list: (params?: any) => request.get("/notifications", { params }),
	unreadCount: () => request.get("/notifications/unread-count"),
	markRead: (id: number) => request.put(`/notifications/${id}/read`),
	markAllRead: () => request.put("/notifications/read-all"),
};

export const reportApi = {
	create: (data: any) => request.post("/reports", data),
};

export const sportApi = {
	getAll: () => request.get("/sports"),
};

export const uploadApi = {
	upload: (file: File) => {
		const formData = new FormData();
		formData.append("file", file);
		return request.post("/upload", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},
};
