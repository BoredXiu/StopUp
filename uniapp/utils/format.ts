export function formatDateTime(date: string | Date): string {
	if (!date) return ""
	const d = new Date(date)
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, "0")
	const day = String(d.getDate()).padStart(2, "0")
	const h = String(d.getHours()).padStart(2, "0")
	const min = String(d.getMinutes()).padStart(2, "0")
	return `${y}-${m}-${day} ${h}:${min}`
}

export function formatDate(date: string | Date): string {
	if (!date) return ""
	const d = new Date(date)
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, "0")
	const day = String(d.getDate()).padStart(2, "0")
	return `${y}-${m}-${day}`
}

export function formatMatchTime(matchDate: string, startTime: string, endTime?: string): string {
	if (!matchDate || !startTime) return ""
	if (endTime) {
		return `${matchDate} ${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`
	}
	return `${matchDate} ${startTime.slice(0, 5)}`
}

export function getStatusText(status: number, type: "match" | "order"): string {
	if (type === "match") {
		const map: Record<number, string> = { 1: "报名中", 2: "已满员", 3: "已开始", 4: "已结束", 5: "已取消" }
		return map[status] || "未知"
	}
	const map: Record<number, string> = { 1: "待支付", 2: "已支付", 3: "已取消", 4: "已完成", 5: "已退款" }
	return map[status] || "未知"
}

export function getFeeTypeText(type: number): string {
	const map: Record<number, string> = { 1: "AA制", 2: "固定费用", 3: "免费" }
	return map[type] || "未知"
}

export function getLevelText(level: number): string {
	const map: Record<number, string> = { 0: "不限", 1: "入门", 2: "初级", 3: "中级", 4: "高级", 5: "专业" }
	return map[level] || "不限"
}

export function getGenderText(gender: number): string {
	const map: Record<number, string> = { 0: "不限", 1: "仅男生", 2: "仅女生" }
	return map[gender] || "不限"
}