const BASE_URL = 'https://api.spotup.com/api'

function request(options) {
  const token = uni.getStorageSync('token')
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      url: BASE_URL + options.url,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success: (res) => {
        const data = res.data
        if (data.code === 200) {
          resolve(data)
        } else if (data.code === 401) {
          uni.removeStorageSync('token')
          uni.reLaunch({ url: '/pages/login/index' })
          reject(new Error(data.message))
        } else {
          uni.showToast({ title: data.message || '请求失败', icon: 'none' })
          reject(new Error(data.message))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      },
    })
  })
}

export const api = {
  get: (url, params) => request({ url, method: 'GET', data: params }),
  post: (url, data) => request({ url, method: 'POST', data }),
  put: (url, data) => request({ url, method: 'PUT', data }),
  delete: (url, data) => request({ url, method: 'DELETE', data }),
}

export const authApi = {
  loginByWechat: (code) => api.post('/auth/wechat-login', { code }),
  loginByPhone: (data) => api.post('/auth/phone-login', data),
  sendSms: (phone) => api.post('/auth/send-sms', { phone }),
}

export const matchApi = {
  list: (params) => api.get('/matches', params),
  detail: (id) => api.get(`/matches/${id}`),
  create: (data) => api.post('/matches', data),
  join: (id) => api.post(`/matches/${id}/join`),
  leave: (id) => api.post(`/matches/${id}/leave`),
  cancel: (id, reason) => api.post(`/matches/${id}/cancel`, { reason }),
  myMatches: (params) => api.get('/matches/my', params),
}

export const venueApi = {
  list: (params) => api.get('/venues', params),
  detail: (id) => api.get(`/venues/${id}`),
}

export const orderApi = {
  myOrders: (params) => api.get('/orders/my', params),
  pay: (id) => api.post(`/orders/${id}/pay`),
  refund: (id, reason) => api.post(`/orders/${id}/refund`, { reason }),
}

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getCreditLogs: (params) => api.get('/users/credit-logs', params),
}

export const notificationApi = {
  list: (params) => api.get('/notifications', params),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  unreadCount: () => api.get('/notifications/unread-count'),
}

export const sportApi = {
  getAll: () => api.get('/sports'),
}