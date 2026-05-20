import type { ApiResponse, PaginatedData, LoginResult, CaptchaData } from "@/types";

const BASE_URL = "http://localhost:3000/api";

interface RequestOptions {
	url: string;
	method?: "GET" | "POST" | "PUT" | "DELETE";
	data?: Record<string, any>;
	header?: Record<string, string>;
	silent?: boolean;
}

function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
	const token: string = uni.getStorageSync("token");
	const silent = options.silent === true;
	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			url: BASE_URL + options.url,
			header: {
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...options.header,
			},
			success: (res) => {
				const data = res.data as ApiResponse;
				if (data.code === 200) {
					resolve(data);
				} else if (data.code === 401) {
					const currentToken: string = uni.getStorageSync("token") || "";
					if (currentToken.startsWith("mock_")) {
						reject(new Error(data.message));
						return;
					}
					uni.removeStorageSync("token");
					uni.removeStorageSync("user");
					uni.reLaunch({ url: "/subpkg/login/index" });
					reject(new Error(data.message || "登录已过期，请重新登录"));
				} else {
					if (!silent) {
						uni.showToast({ title: data.message || "请求失败", icon: "none" });
					}
					reject(new Error(data.message));
				}
			},
			fail: (err) => {
				if (!silent) {
					uni.showToast({ title: "网络错误", icon: "none" });
				}
				reject(err);
			},
		});
	});
}

export const api = {
	get: <T = any>(url: string, params?: Record<string, any>, silent = false) => request<T>({ url, method: "GET", data: params, silent }),
	post: <T = any>(url: string, data?: Record<string, any>, silent = false) => request<T>({ url, method: "POST", data, silent }),
	put: <T = any>(url: string, data?: Record<string, any>, silent = false) => request<T>({ url, method: "PUT", data, silent }),
	delete: <T = any>(url: string, data?: Record<string, any>, silent = false) => request<T>({ url, method: "DELETE", data, silent }),
};

export const authApi = {
	loginByWechat: (code: string) => api.post<LoginResult>("/auth/login/wechat", { code }, true),
	loginByPhone: (data: { phone: string; password: string; captchaId: string; captchaCode: string }) => api.post<LoginResult>("/auth/login/phone", data, true),
	register: (data: { phone: string; password: string; nickname?: string; captchaId: string; captchaCode: string }) =>
		api.post<LoginResult>("/auth/register", data, true),
	getCaptcha: () => api.get<CaptchaData>("/auth/captcha", undefined, true),
};

export const matchApi = {
	list: (params?: Record<string, any>) => api.get<PaginatedData<any>>("/matches", params),
	detail: (id: number) => api.get<any>(`/matches/${id}`),
	create: (data: Record<string, any>) => api.post("/matches", data),
	join: (id: number) => api.post(`/matches/${id}/join`),
	leave: (id: number) => api.post(`/matches/${id}/leave`),
	cancel: (id: number, reason?: string) => api.post(`/matches/${id}/cancel`, { reason }),
	myMatches: (params?: Record<string, any>) => api.get<PaginatedData<any>>("/matches/my", params),
};

export const venueApi = {
	list: (params?: Record<string, any>) => api.get<PaginatedData<any>>("/venues", params),
	detail: (id: number) => api.get<any>(`/venues/${id}`),
};

export const orderApi = {
	myOrders: (params?: Record<string, any>) => api.get<PaginatedData<any>>("/orders", params),
	pay: (id: number) => api.post<any>(`/orders/${id}/pay`),
	payConfirm: (id: number, payOrderNo: string) => api.post<any>(`/orders/${id}/pay/confirm`, { payOrderNo }),
	refund: (id: number, reason?: string) => api.post(`/orders/${id}/refund`, { reason }),
};

export const userApi = {
	getProfile: () => api.get<any>("/users/profile"),
	updateProfile: (data: Record<string, any>) => api.put("/users/profile", data),
	getCreditLogs: (params?: Record<string, any>) => api.get<PaginatedData<any>>("/users/credit-logs", params),
	list: (params?: Record<string, any>) => api.get<PaginatedData<any>>("/users", params),
};

export const notificationApi = {
	list: (params?: Record<string, any>) => api.get<PaginatedData<any>>("/notifications", params),
	markRead: (id: number) => api.put(`/notifications/${id}/read`),
	markAllRead: () => api.put("/notifications/read-all"),
	unreadCount: () => api.get<{ count: number }>("/notifications/unread-count"),
};

export const reportApi = {
	create: (data: Record<string, any>) => api.post("/reports", data),
};

export const feedbackApi = {
	create: (data: Record<string, any>) => api.post("/feedbacks", data),
};

export const uploadApi = {
	upload: (filePath: string) => {
		return new Promise<ApiResponse<{ url: string }>>((resolve, reject) => {
			uni.uploadFile({
				url: BASE_URL + "/upload",
				filePath,
				name: "file",
				header: {
					Authorization: `Bearer ${uni.getStorageSync("token")}`,
				},
				success: (res) => {
					try {
						const data = JSON.parse(res.data) as ApiResponse<{ url: string }>;
						if (data.code === 200) resolve(data);
						else reject(new Error(data.message));
					} catch {
						reject(new Error("上传失败"));
					}
				},
				fail: reject,
			});
		});
	},
	uploadTmp: (filePath: string, category?: string) => {
		return new Promise<ApiResponse<{ url: string; filename: string }>>((resolve, reject) => {
			const formData: any = {};
			if (category) formData.category = category;
			uni.uploadFile({
				url: BASE_URL + "/upload/tmp",
				filePath,
				name: "file",
				formData,
				header: {
					Authorization: `Bearer ${uni.getStorageSync("token")}`,
				},
				success: (res) => {
					try {
						const data = JSON.parse(res.data) as ApiResponse<{ url: string; filename: string }>;
						if (data.code === 200) resolve(data);
						else reject(new Error(data.message));
					} catch {
						reject(new Error("上传失败"));
					}
				},
				fail: reject,
			});
		});
	},
	confirm: (filename: string, category?: string) => {
		return api.post<{ url: string }>("/upload/confirm", { filename, category });
	},
};

export const sportApi = {
	getAll: () => api.get<any[]>("/sports"),
};

export const regionApi = {
	getProvinces: () => api.get<{ name: string }[]>("/regions"),
	getCities: (province: string) => api.get<{ name: string }[]>("/regions", { province }),
	getDistricts: (province: string, city: string) => api.get<string[]>("/regions", { province, city }),
	getFull: () => api.get<any[]>("/regions/full"),
};

export const walletApi = {
	getBalance: () => api.get<{ balance: number }>("/wallet/balance"),
	recharge: (amount: number) =>
		api.post<{
			orderNo: string;
			prepayParams: {
				timeStamp: string;
				nonceStr: string;
				package: string;
				signType: string;
				paySign: string;
			};
		}>("/wallet/recharge", { amount }),
	confirmRecharge: (orderNo: string) =>
		api.post<{
			orderNo: string;
			amount: number;
			balanceBefore: number;
			balanceAfter: number;
		}>("/wallet/recharge/confirm", { orderNo }),
	getTransactions: (params?: Record<string, any>) => api.get<PaginatedData<any>>("/wallet/transactions", params),
};
