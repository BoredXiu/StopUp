import dayjs from 'dayjs'

export function formatDate(date: string | Date, format = 'YYYY-MM-DD') {
  return dayjs(date).format(format)
}

export function formatTime(time: string) {
  return time?.slice(0, 5) || ''
}

export function formatDateTime(date: string | Date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

export function getMatchStatusText(status: number): string {
  const map: Record<number, string> = {
    1: '报名中',
    2: '已满员',
    3: '已开始',
    4: '已结束',
    5: '已取消',
  }
  return map[status] || '未知'
}

export function getMatchStatusType(status: number): 'success' | 'warning' | 'danger' | 'info' | '' {
  const map: Record<number, 'success' | 'warning' | 'danger' | 'info' | ''> = {
    1: 'success',
    2: 'warning',
    3: '',
    4: 'info',
    5: 'danger',
  }
  return map[status] || 'info'
}

export function getFeeTypeText(type: number): string {
  const map: Record<number, string> = { 1: 'AA制', 2: '固定费用', 3: '免费' }
  return map[type] || '未知'
}

export function getLevelText(level: number): string {
  const map: Record<number, string> = {
    0: '不限', 1: '入门', 2: '初级', 3: '中级', 4: '高级', 5: '专业',
  }
  return map[level] || '不限'
}

export function getGenderText(gender: number): string {
  const map: Record<number, string> = { 0: '不限', 1: '仅男生', 2: '仅女生' }
  return map[gender] || '不限'
}

export function getOrderStatusText(status: number): string {
  const map: Record<number, string> = {
    1: '待支付', 2: '已支付', 3: '已取消', 4: '已完成', 5: '已退款',
  }
  return map[status] || '未知'
}