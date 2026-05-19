import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";

const service = axios.create({
	baseURL: "/api",
	timeout: 15000,
});

service.interceptors.request.use((config) => {
	const token = localStorage.getItem("admin_token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

service.interceptors.response.use(
	(response) => {
		const res = response.data;
		if (res.code !== 200) {
			ElMessage.error(res.message || "请求失败");
			if (res.code === 401) {
				localStorage.removeItem("admin_token");
				router.push("/login");
			}
			return Promise.reject(new Error(res.message));
		}
		return res;
	},
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("admin_token");
			router.push("/login");
		}
		ElMessage.error(error.message || "网络错误");
		return Promise.reject(error);
	},
);

export default service;

export const adminApi = {
	login: (data: { username: string; password: string; rememberMe?: boolean }) => service.post("/admin/login", data),
	dashboard: () => service.get("/admin/dashboard"),
	getUsers: (params?: any) => service.get("/admin/users", { params }),
	updateUserStatus: (id: number, status: number) => service.put(`/admin/users/${id}/status`, { status }),
	getMatches: (params?: any) => service.get("/admin/matches", { params }),
	updateMatchStatus: (id: number, data: any) => service.put(`/admin/matches/${id}/status`, data),
	getVenues: (params?: any) => service.get("/admin/venues", { params }),
	createVenue: (data: any) => service.post("/admin/venues", data),
	updateVenue: (id: number, data: any) => service.put(`/admin/venues/${id}`, data),
	getOrders: (params?: any) => service.get("/admin/orders", { params }),
	getReports: (params?: any) => service.get("/admin/reports", { params }),
	getReportDetail: (id: number) => service.get(`/admin/reports/${id}`),
	handleReport: (id: number, data: any) => service.put(`/admin/reports/${id}/handle`, data),
};
