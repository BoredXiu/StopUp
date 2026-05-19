<template>
	<view class="page">
		<view
			class="match-header"
			v-if="match"
		>
			<image
				:src="match.coverImage || getVenueImage(match.id)"
				class="cover-image"
				mode="aspectFill"
			/>
			<view class="match-basic">
				<text class="match-title">{{ match.title }}</text>
				<view class="match-tags">
					<text class="tag">{{ match.sportName }}</text>
					<text
						class="tag"
						:class="statusClass"
						>{{ statusText }}</text
					>
				</view>
			</view>
		</view>

		<view
			class="info-card"
			v-if="match"
		>
			<view class="info-row">
				<text class="info-label">时间</text>
				<text class="info-value">{{ match.matchDate }} {{ match.startTime }} - {{ match.endTime }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">人数</text>
				<text class="info-value">{{ match.currentPlayers }}/{{ match.maxPlayers }}人 (最少{{ match.minPlayers }}人)</text>
			</view>
			<view
				class="info-row"
				v-if="match.venueName"
			>
				<text class="info-label">场馆</text>
				<text
					class="info-value link"
					@tap="goVenue"
					>{{ match.venueName }}</text
				>
			</view>
			<view class="info-row">
				<text class="info-label">费用</text>
				<text class="info-value price">¥{{ match.perPersonFee || 0 }}/人</text>
			</view>
			<view
				class="info-row"
				v-if="match.levelRequired"
			>
				<text class="info-label">水平</text>
				<text class="info-value">{{ levelText }}</text>
			</view>
		</view>

		<view
			class="section"
			v-if="match && match.description"
		>
			<view class="section-title">场局描述</view>
			<text class="desc-text">{{ match.description }}</text>
		</view>

		<view class="section">
			<view class="section-title">成员列表 ({{ members.length }}人)</view>
			<view class="member-list">
				<view
					v-for="m in members"
					:key="m.id"
					class="member-item"
				>
					<image
						:src="avatarFailed[m.userId] ? '' : m.avatar || ''"
						class="member-avatar"
						mode="aspectFill"
						@error="onAvatarError(m.userId)"
					/>
					<view class="member-info">
						<text class="member-name">
							{{ m.nickname }}
							<text
								v-if="m.role === 1"
								class="creator-tag"
								>创建者</text
							>
						</text>
						<text class="member-credit">信用 {{ m.creditScore }}</text>
					</view>
				</view>
			</view>
		</view>

		<view
			class="bottom-bar"
			v-if="match"
		>
			<block v-if="match.status === 1 && !isJoined">
				<button
					class="btn-primary"
					@tap="handleJoin"
				>
					立即报名
				</button>
			</block>
			<block v-else-if="match.status === 1 && isJoined && !isCreator">
				<button
					class="btn-warning"
					@tap="handleLeave"
				>
					退出场局
				</button>
			</block>
			<block v-else-if="isCreator && (match.status === 1 || match.status === 2)">
				<button
					class="btn-danger"
					@tap="handleCancel"
				>
					取消场局
				</button>
			</block>
			<block v-else>
				<button
					class="btn-disabled"
					disabled
				>
					{{ statusText }}
				</button>
			</block>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { matchApi } from "@/api";
	import { useUserStore } from "@/store/user";
	import type { Match, MatchMember } from "@/types";

	const VENUE_PICS = [
		"https://picsum.photos/seed/match1/400/300",
		"https://picsum.photos/seed/match2/400/300",
		"https://picsum.photos/seed/match3/400/300",
		"https://picsum.photos/seed/match4/400/300",
		"https://picsum.photos/seed/match5/400/300",
		"https://picsum.photos/seed/match6/400/300",
		"https://picsum.photos/seed/match7/400/300",
		"https://picsum.photos/seed/match8/400/300",
		"https://picsum.photos/seed/match9/400/300",
		"https://picsum.photos/seed/match10/400/300",
	];

	function getVenueImage(seed: number): string {
		return VENUE_PICS[seed % VENUE_PICS.length];
	}

	const userStore = useUserStore();
	const match = ref<Match | null>(null);
	const members = ref<MatchMember[]>([]);
	const avatarFailed = ref<Record<number, boolean>>({});

	const statusText = computed(() => {
		const map: Record<number, string> = { 1: "报名中", 2: "已满员", 3: "已开始", 4: "已结束", 5: "已取消" };
		return map[(match.value && match.value.status) || 0] || "未知";
	});
	const statusClass = computed(() => {
		const map: Record<number, string> = { 1: "open", 2: "full", 3: "started", 4: "ended", 5: "cancelled" };
		return map[(match.value && match.value.status) || 0] || "";
	});
	const levelText = computed(() => {
		const map: Record<number, string> = { 1: "入门", 2: "初级", 3: "中级", 4: "高级", 5: "专业" };
		return map[(match.value && match.value.levelRequired) || 0] || "不限";
	});
	const isCreator = computed(() => (match.value && match.value.creatorId) === (userStore.user && userStore.user.id));
	const isJoined = computed(() => members.value.some((m) => m.userId === (userStore.user && userStore.user.id)));

	function goVenue(): void {
		if (match.value && match.value.venueId) {
			uni.navigateTo({ url: `/subpkg/venue/detail?id=${match.value.venueId}` });
		}
	}

	async function handleJoin(): Promise<void> {
		if (!match.value) return;
		try {
			await matchApi.join(match.value.id);
		} catch (_) {
			/* mock */
		}
		uni.showToast({ title: "报名成功", icon: "success" });
		if (match.value) {
			match.value.isJoined = true;
			match.value.currentPlayers = (match.value.currentPlayers || 0) + 1;
		}
	}

	async function handleLeave(): Promise<void> {
		if (!match.value) return;
		const res = await uni.showModal({ title: "确认退出？", content: "退出场局可能影响信用分" });
		if (!res.confirm) return;
		try {
			await matchApi.leave(match.value.id);
		} catch (_) {
			/* mock */
		}
		uni.showToast({ title: "已退出", icon: "success" });
		if (match.value) {
			match.value.isJoined = false;
			match.value.currentPlayers = Math.max(0, (match.value.currentPlayers || 0) - 1);
			members.value = members.value.filter((m) => m.userId !== (userStore.user && userStore.user.id));
		}
	}

	async function handleCancel(): Promise<void> {
		if (!match.value) return;
		const res = await uni.showModal({ title: "确认取消场局？", content: "取消场局将影响信用分" });
		if (!res.confirm) return;
		try {
			await matchApi.cancel(match.value.id, "创建者取消");
		} catch (_) {
			/* mock */
		}
		uni.showToast({ title: "已取消", icon: "success" });
		if (match.value) {
			match.value.status = 5;
		}
	}

	async function fetchDetail(): Promise<void> {
		const pages = getCurrentPages();
		const options = pages[pages.length - 1].options as Record<string, string>;
		const id = Number(options.id);
		if (!id) return;
		try {
			const res = await matchApi.detail(id);
			match.value = res.data;
			members.value = res.data.members || [];
		} catch (_) {
			match.value = mockMatchDetail(id);
			members.value = mockMembers(id);
		}
	}

	function mockMatchDetail(id: number): Match {
		const sportNames = ["篮球", "足球", "羽毛球", "网球", "乒乓球", "排球", "跑步", "游泳"];
		const sportIcons = ["🏀", "⚽", "🏸", "🎾", "🏓", "🏐", "🏊", "🏃"];
		const idx = id % 8;
		return {
			id,
			title: ["周末篮球3v3", "周五羽毛球双打", "晚间足球友谊赛", "网球单打挑战", "乒乓对抗赛", "排球娱乐局", "晨跑打卡", "游泳训练"][idx],
			sportId: idx + 1,
			sportName: sportNames[idx],
			sportIcon: sportIcons[idx],
			venueId: idx + 1,
			venueName: ["星海体育中心", "阳光运动馆", "奥体中心", "城市运动公园", "大学城体育馆", "社区运动场", "蓝天体育馆", "绿茵球场"][idx],
			venueAddress: "北京市朝阳区某路" + id + "号",
			venueCity: "北京",
			creatorId: 1,
			creatorNickname: "张三",
			creatorAvatar: "",
			matchDate: "2026-05-20",
			startTime: "14:00",
			endTime: "16:00",
			maxPlayers: 12,
			minPlayers: 4,
			currentPlayers: 5,
			feeType: 1,
			totalFee: 0,
			perPersonFee: 30,
			levelRequired: 0,
			genderRequired: 0,
			description: "一起来运动吧！无论你是新手还是老手，都欢迎加入。",
			coverImage: "",
			status: 1,
			cancelReason: "",
			isFeatured: idx < 3 ? 1 : 0,
			viewCount: 100 + id,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
	}

	function mockMembers(matchId: number): MatchMember[] {
		const names = ["张三", "李四", "王五", "赵六", "陈七"];
		return names.map((name, i) => ({
			id: i + 1,
			userId: i + 1,
			nickname: name,
			avatar: "",
			creditScore: 100,
			role: i === 0 ? 1 : 0,
			status: 1,
			joinedAt: new Date().toISOString(),
		}));
	}

	function onAvatarError(uid: number): void {
		avatarFailed.value[uid] = true;
	}

	onLoad(() => {
		fetchDetail();
	});
</script>

<style scoped>
	.page {
		background: #f5f5f5;
		min-height: 100vh;
		padding-bottom: 70px;
	}
	.match-header {
		position: relative;
	}
	.cover-image {
		width: 100%;
		height: 200px;
	}
	.match-basic {
		padding: 14px 16px;
		background: #fff;
	}
	.match-title {
		font-size: 18px;
		font-weight: 700;
		display: block;
		color: #333;
	}
	.match-tags {
		margin-top: 6px;
		display: flex;
		gap: 6px;
	}
	.tag {
		padding: 2px 8px;
		border-radius: 4px;
		background: #f0f0f0;
		font-size: 12px;
		color: #666;
	}
	.tag.open {
		background: #ecf5ff;
		color: #409eff;
	}
	.tag.full {
		background: #fff7e6;
		color: #e6a23c;
	}
	.tag.cancelled {
		background: #fef0f0;
		color: #f56c6c;
	}
	.info-card {
		background: #fff;
		margin: 10px 0;
		padding: 0 16px;
	}
	.info-row {
		display: flex;
		padding: 12px 0;
		border-bottom: 1px solid #f5f5f5;
		align-items: center;
	}
	.info-label {
		width: 50px;
		font-size: 13px;
		color: #999;
		flex-shrink: 0;
	}
	.info-value {
		flex: 1;
		font-size: 14px;
		color: #333;
	}
	.info-value.link {
		color: #409eff;
	}
	.info-value.price {
		color: #f56c6c;
		font-weight: 600;
	}
	.section {
		background: #fff;
		margin: 10px 0;
		padding: 14px 16px;
	}
	.section-title {
		font-size: 15px;
		font-weight: 700;
		margin-bottom: 10px;
		color: #333;
	}
	.desc-text {
		font-size: 14px;
		color: #666;
		line-height: 1.6;
	}
	.member-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.member-item {
		display: flex;
		align-items: center;
	}
	.member-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		margin-right: 10px;
		background: #e0e8f0;
	}
	.member-info {
		flex: 1;
	}
	.member-name {
		font-size: 14px;
		color: #333;
	}
	.creator-tag {
		padding: 1px 4px;
		background: #ecf5ff;
		color: #409eff;
		font-size: 10px;
		border-radius: 3px;
		margin-left: 4px;
	}
	.member-credit {
		font-size: 11px;
		color: #999;
		display: block;
	}
	.bottom-bar {
		position: fixed;
		bottom: 0;
		width: 100%;
		padding: 10px 16px;
		background: #fff;
		box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
		box-sizing: border-box;
	}
	.btn-primary {
		background: #409eff;
		color: #fff;
		border-radius: 8px;
		height: 44px;
		line-height: 44px;
		text-align: center;
		font-size: 15px;
	}
	.btn-warning {
		background: #e6a23c;
		color: #fff;
		border-radius: 8px;
		height: 44px;
		line-height: 44px;
		text-align: center;
		font-size: 15px;
	}
	.btn-danger {
		background: #f56c6c;
		color: #fff;
		border-radius: 8px;
		height: 44px;
		line-height: 44px;
		text-align: center;
		font-size: 15px;
	}
	.btn-disabled {
		background: #ddd;
		color: #999;
		border-radius: 8px;
		height: 44px;
	}
</style>
