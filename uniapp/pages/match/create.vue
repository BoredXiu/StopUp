<template>
  <view class="page">
    <view class="form-card">
      <view class="form-title">创建球局</view>

      <view class="form-group">
        <text class="form-label">球局标题</text>
        <input class="form-input" v-model="form.title" placeholder="如：周六下午篮球3v3" maxlength="100" />
      </view>

      <view class="form-group">
        <text class="form-label">运动类型</text>
        <picker :range="sportNames" @change="onSportChange">
          <view class="picker-value">{{ form.sportName || '请选择运动类型' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">日期</text>
        <picker mode="date" @change="onDateChange">
          <view class="picker-value">{{ form.matchDate || '请选择日期' }}</view>
        </picker>
      </view>

      <view class="form-row">
        <view class="form-group half">
          <text class="form-label">开始时间</text>
          <picker mode="time" @change="onStartTimeChange">
            <view class="picker-value">{{ form.startTime || '开始' }}</view>
          </picker>
        </view>
        <view class="form-group half">
          <text class="form-label">结束时间</text>
          <picker mode="time" @change="onEndTimeChange">
            <view class="picker-value">{{ form.endTime || '结束' }}</view>
          </picker>
        </view>
      </view>

      <view class="form-row">
        <view class="form-group half">
          <text class="form-label">最大人数</text>
          <input class="form-input" v-model.number="form.maxPlayers" type="number" />
        </view>
        <view class="form-group half">
          <text class="form-label">最少人数</text>
          <input class="form-input" v-model.number="form.minPlayers" type="number" />
        </view>
      </view>

      <view class="form-group">
        <text class="form-label">费用模式</text>
        <picker :range="feeTypes" @change="onFeeTypeChange">
          <view class="picker-value">{{ feeTypes[form.feeType - 1] || '请选择' }}</view>
        </picker>
      </view>

      <view class="form-row" v-if="form.feeType !== 3">
        <view class="form-group half">
          <text class="form-label">总费用(元)</text>
          <input class="form-input" v-model.number="form.totalFee" type="digit" />
        </view>
        <view class="form-group half">
          <text class="form-label">人均(元)</text>
          <input class="form-input" v-model.number="form.perPersonFee" type="digit" />
        </view>
      </view>

      <view class="form-group">
        <text class="form-label">水平要求</text>
        <picker :range="levels" @change="onLevelChange">
          <view class="picker-value">{{ levels[form.levelRequired] }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">性别要求</text>
        <picker :range="genders" @change="onGenderChange">
          <view class="picker-value">{{ genders[form.genderRequired] }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">球局描述</text>
        <textarea class="form-textarea" v-model="form.description" placeholder="补充一些球局信息..." maxlength="1000" />
      </view>

      <button class="submit-btn" @tap="handleSubmit" :loading="submitting">创建球局</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { matchApi, sportApi } from '@/api'

const sports = ref([])
const sportNames = ref([])
const feeTypes = ['AA制', '固定费用', '免费']
const levels = ['不限', '入门', '初级', '中级', '高级', '专业']
const genders = ['不限', '仅男生', '仅女生']
const submitting = ref(false)

const form = reactive({
  title: '',
  sportId: null,
  sportName: '',
  matchDate: '',
  startTime: '',
  endTime: '',
  maxPlayers: 10,
  minPlayers: 4,
  feeType: 1,
  totalFee: 0,
  perPersonFee: 0,
  levelRequired: 0,
  genderRequired: 0,
  description: '',
})

function onSportChange(e) {
  const idx = e.detail.value
  form.sportId = sports.value[idx].id
  form.sportName = sports.value[idx].name
}
function onDateChange(e) { form.matchDate = e.detail.value }
function onStartTimeChange(e) { form.startTime = e.detail.value }
function onEndTimeChange(e) { form.endTime = e.detail.value }
function onFeeTypeChange(e) { form.feeType = e.detail.value + 1 }
function onLevelChange(e) { form.levelRequired = e.detail.value }
function onGenderChange(e) { form.genderRequired = e.detail.value }

async function handleSubmit() {
  if (!form.title) { uni.showToast({ title: '请输入标题', icon: 'none' }); return }
  if (!form.sportId) { uni.showToast({ title: '请选择运动类型', icon: 'none' }); return }
  if (!form.matchDate) { uni.showToast({ title: '请选择日期', icon: 'none' }); return }
  if (!form.startTime || !form.endTime) { uni.showToast({ title: '请选择时间', icon: 'none' }); return }

  submitting.value = true
  try {
    await matchApi.create({
      title: form.title,
      sport_id: form.sportId,
      match_date: form.matchDate,
      start_time: form.startTime,
      end_time: form.endTime,
      max_players: form.maxPlayers,
      min_players: form.minPlayers,
      fee_type: form.feeType,
      total_fee: form.totalFee,
      per_person_fee: form.perPersonFee,
      level_required: form.levelRequired,
      gender_required: form.genderRequired,
      description: form.description,
    })
    uni.showToast({ title: '创建成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } finally { submitting.value = false }
}

onMounted(async () => {
  const res = await sportApi.getAll()
  sports.value = res.data
  sportNames.value = res.data.map((s) => s.name)
})
</script>

<style scoped>
.page { padding: 16px; padding-bottom: 40px; }
.form-card { background: #fff; border-radius: 12px; padding: 20px; }
.form-title { font-size: 20px; font-weight: 700; margin-bottom: 20px; text-align: center; }
.form-group { margin-bottom: 16px; }
.form-label { font-size: 13px; color: #666; display: block; margin-bottom: 6px; }
.form-input {
  height: 44px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  background: #fafafa;
}
.form-textarea {
  width: 100%;
  height: 100px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  background: #fafafa;
  box-sizing: border-box;
}
.picker-value {
  height: 44px;
  line-height: 44px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  background: #fafafa;
  color: #333;
}
.form-row { display: flex; gap: 12px; }
.half { flex: 1; }
.submit-btn {
  width: 100%;
  height: 48px;
  line-height: 48px;
  background: #409EFF;
  color: #fff;
  border-radius: 24px;
  font-size: 16px;
  border: none;
  margin-top: 8px;
}
</style>