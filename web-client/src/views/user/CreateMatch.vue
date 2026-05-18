<template>
  <div class="create-match-page container page-container">
    <h1 class="page-title">创建球局</h1>

    <div class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="top"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="球局标题" prop="title">
              <el-input v-model="form.title" placeholder="如：周六下午篮球3v3" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运动类型" prop="sport_id">
              <el-select v-model="form.sport_id" placeholder="选择运动类型" style="width: 100%">
                <el-option v-for="s in sports" :key="s.id" :label="s.name" :value="s.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="日期" prop="match_date">
              <el-date-picker v-model="form.match_date" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开始时间" prop="start_time">
              <el-time-picker v-model="form.start_time" placeholder="开始时间" format="HH:mm" value-format="HH:mm" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结束时间" prop="end_time">
              <el-time-picker v-model="form.end_time" placeholder="结束时间" format="HH:mm" value-format="HH:mm" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="最大人数" prop="max_players">
              <el-input-number v-model="form.max_players" :min="2" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最少成局人数" prop="min_players">
              <el-input-number v-model="form.min_players" :min="2" :max="form.max_players" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="费用模式" prop="fee_type">
              <el-select v-model="form.fee_type" style="width: 100%">
                <el-option label="AA制" :value="1" />
                <el-option label="固定费用" :value="2" />
                <el-option label="免费" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24" v-if="form.fee_type !== 3">
          <el-col :span="12">
            <el-form-item label="总费用(元)" prop="total_fee">
              <el-input-number v-model="form.total_fee" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="人均费用(元)" prop="per_person_fee">
              <el-input-number v-model="form.per_person_fee" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="水平要求">
              <el-select v-model="form.level_required" style="width: 100%">
                <el-option label="不限" :value="0" />
                <el-option label="入门" :value="1" />
                <el-option label="初级" :value="2" />
                <el-option label="中级" :value="3" />
                <el-option label="高级" :value="4" />
                <el-option label="专业" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别要求">
              <el-select v-model="form.gender_required" style="width: 100%">
                <el-option label="不限" :value="0" />
                <el-option label="仅男生" :value="1" />
                <el-option label="仅女生" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="场馆">
          <el-select v-model="form.venue_id" placeholder="选择场馆（可选）" clearable filterable style="width: 100%">
            <el-option v-for="v in venues" :key="v.id" :label="v.name" :value="v.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="球局描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="补充一些球局信息，如注意事项、联系方式等"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" @click="handleSubmit" :loading="submitting">
            创建球局
          </el-button>
          <el-button size="large" @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { matchApi, sportApi, venueApi } from '@/api'
import type { Sport, Venue } from '@/types'

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const sports = ref<Sport[]>([])
const venues = ref<Venue[]>([])

const form = reactive({
  title: '',
  sport_id: null as number | null,
  match_date: '',
  start_time: '',
  end_time: '',
  max_players: 10,
  min_players: 4,
  fee_type: 1,
  total_fee: 0,
  per_person_fee: 0,
  level_required: 0,
  gender_required: 0,
  venue_id: null as number | null,
  description: '',
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入球局标题', trigger: 'blur' }],
  sport_id: [{ required: true, message: '请选择运动类型', trigger: 'change' }],
  match_date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  start_time: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  end_time: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  max_players: [{ required: true, message: '请设置最大人数', trigger: 'blur' }],
  min_players: [{ required: true, message: '请设置最少人数', trigger: 'blur' }],
  fee_type: [{ required: true, message: '请选择费用模式', trigger: 'change' }],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await matchApi.create(form)
    ElMessage.success('球局创建成功')
    router.push('/user/matches')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const [sportsRes, venuesRes] = await Promise.all([
    sportApi.getAll(),
    venueApi.list({ pageSize: 100 }),
  ])
  sports.value = sportsRes.data
  venues.value = venuesRes.data.list
})
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
}
.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  max-width: 900px;
}
</style>