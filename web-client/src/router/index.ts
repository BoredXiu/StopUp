import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
	{
		path: "/",
		component: () => import("@/layouts/DefaultLayout.vue"),
		children: [
			{ path: "", name: "Home", component: () => import("@/views/Home.vue"), meta: { title: "首页" } },
			{ path: "matches/:id", name: "MatchDetail", component: () => import("@/views/MatchDetail.vue"), meta: { title: "球局详情" } },
			{ path: "venues", name: "Venues", component: () => import("@/views/Venues.vue"), meta: { title: "场馆列表" } },
			{ path: "venues/:id", name: "VenueDetail", component: () => import("@/views/VenueDetail.vue"), meta: { title: "场馆详情" } },
			{ path: "search", name: "Search", component: () => import("@/views/Search.vue"), meta: { title: "搜索" } },
		],
	},
	{
		path: "/user",
		component: () => import("@/layouts/DefaultLayout.vue"),
		meta: { requiresAuth: true },
		children: [
			{ path: "profile", name: "Profile", component: () => import("@/views/user/Profile.vue"), meta: { title: "个人中心" } },
			{ path: "create-match", name: "CreateMatch", component: () => import("@/views/user/CreateMatch.vue"), meta: { title: "创建球局" } },
			{ path: "notifications", name: "Notifications", component: () => import("@/views/user/Notifications.vue"), meta: { title: "消息通知" } },
		],
	},
	{
		path: "/login",
		name: "Login",
		component: () => import("@/views/Login.vue"),
		meta: { title: "登录" },
	},
	{
		path: "/:pathMatch(.*)*",
		name: "NotFound",
		component: () => import("@/views/NotFound.vue"),
		meta: { title: "404" },
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to, from, next) => {
	document.title = `${to.meta.title || "拼个场"} - 拼个场`;
	const token = localStorage.getItem("token");
	if (to.meta.requiresAuth && !token) {
		next({ name: "Login", query: { redirect: to.fullPath } });
	} else {
		next();
	}
});

export default router;
