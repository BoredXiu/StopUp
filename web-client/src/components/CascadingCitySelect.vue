<template>
	<div class="cascading-city" :class="{ 'cascading-city--compact': compact }">
		<el-button
			v-if="showLocate"
			class="locate-btn"
			@click="handleLocate"
			:loading="locating"
		>
			<el-icon><Location /></el-icon>
			<span v-if="!compact">{{ displayLocation || "定位" }}</span>
		</el-button>
		<el-select
			v-model="selectedProvince"
			placeholder="省"
			@change="onProvinceChange"
			:teleported="false"
		>
			<el-option
				v-for="p in provinces"
				:key="p.name"
				:label="p.name"
				:value="p.name"
			/>
		</el-select>
		<el-select
			v-model="selectedCity"
			placeholder="市"
			@change="onCityChange"
			:disabled="!selectedProvince || selectedProvince === '全国'"
			:teleported="false"
		>
			<el-option
				v-for="c in cities"
				:key="c.name"
				:label="c.name"
				:value="c.name"
			/>
		</el-select>
		<el-select
			v-model="selectedDistrict"
			placeholder="县/区"
			@change="emitValue"
			:disabled="!selectedCity || selectedCity === '不限'"
			:teleported="false"
		>
			<el-option
				v-for="d in districts"
				:key="d.name"
				:label="d.name"
				:value="d.name"
			/>
		</el-select>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, watch, onMounted } from "vue";
	import { Location } from "@element-plus/icons-vue";
	import { getProvinces, getCitiesByProvince, getDistrictsByCity, findRegion } from "@/data/regions";
	import type { Province, City, District } from "@/data/regions";

	const props = withDefaults(
		defineProps<{
			modelValue: string;
			showLocate?: boolean;
			compact?: boolean;
			storageKey?: string;
		}>(),
		{
			showLocate: true,
			compact: false,
			storageKey: "recent_city",
		}
	);

	const emit = defineEmits<{
		"update:modelValue": [value: string];
	}>();

	const provinces = ref<Province[]>(getProvinces());
	const cities = ref<City[]>([]);
	const districts = ref<District[]>([]);
	const locating = ref(false);
	const displayLocation = ref("");

	const selectedProvince = ref("");
	const selectedCity = ref("");
	const selectedDistrict = ref("");

	const STORAGE_KEY = `spotup_${props.storageKey}`;

	function parseValue(value: string): { p: string; c: string; d: string } {
		if (!value) return { p: "", c: "", d: "" };
		const parts = value.split("-");
		return {
			p: parts[0] || "",
			c: parts[1] || "",
			d: parts[2] || "",
		};
	}

	function buildValue(): string {
		if (!selectedProvince.value || selectedProvince.value === "全国") return "";
		const parts = [selectedProvince.value];
		if (selectedCity.value && selectedCity.value !== "不限") {
			parts.push(selectedCity.value);
			if (selectedDistrict.value && selectedDistrict.value !== "不限") {
				parts.push(selectedDistrict.value);
			}
		}
		return parts.join("-");
	}

	function emitValue(): void {
		const val = buildValue();
		emit("update:modelValue", val);
		saveRecent();
	}

	function saveRecent(): void {
		const val = buildValue();
		if (!val) return;
		try {
			const recents = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
			const filtered = recents.filter((r) => r !== val);
			filtered.unshift(val);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 5)));
		} catch {
			/* ignore */
		}
	}

	watch(() => props.modelValue, (newVal) => {
		if (!newVal) {
			selectedProvince.value = "";
			selectedCity.value = "";
			selectedDistrict.value = "";
			cities.value = [];
			districts.value = [];
			return;
		}
		const { p, c, d } = parseValue(newVal);
		if (p !== selectedProvince.value) {
			selectedProvince.value = p;
			cities.value = p ? getCitiesByProvince(p) : [];
		}
		if (c !== selectedCity.value) {
			selectedCity.value = c;
			districts.value = p && c ? getDistrictsByCity(p, c) : [];
		}
		if (d !== selectedDistrict.value) {
			selectedDistrict.value = d;
		}
	}, { immediate: true });

	function onProvinceChange(): void {
		selectedCity.value = "";
		selectedDistrict.value = "";
		districts.value = [];
		cities.value = selectedProvince.value ? getCitiesByProvince(selectedProvince.value) : [];
		if (!selectedProvince.value || selectedProvince.value === "全国") {
			emit("update:modelValue", "");
			return;
		}
		if (cities.value.length === 1 && cities.value[0].name === selectedProvince.value) {
			selectedCity.value = cities.value[0].name;
			districts.value = getDistrictsByCity(selectedProvince.value, cities.value[0].name);
		}
		emitValue();
	}

	function onCityChange(): void {
		selectedDistrict.value = "";
		districts.value = selectedProvince.value && selectedCity.value
			? getDistrictsByCity(selectedProvince.value, selectedCity.value)
			: [];
		emitValue();
	}

	async function handleLocate(): Promise<void> {
		if (!navigator.geolocation) return;
		locating.value = true;
		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
			});
			const { latitude, longitude } = position.coords;
			const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&accept-language=zh`);
			const data = await res.json();
			const addr = data.address || {};
			const province = addr.province || "";
			const city = addr.city || addr.town || "";
			const district = addr.district || addr.county || "";

			if (province && city) {
				selectedProvince.value = province;
				cities.value = getCitiesByProvince(province);

				const matchedCity = cities.value.find((c) => c.name.includes(city) || city.includes(c.name));
				if (matchedCity) {
					selectedCity.value = matchedCity.name;
					districts.value = getDistrictsByCity(province, matchedCity.name);

					if (district) {
						const matchedDist = districts.value.find((d) => d.name.includes(district) || district.includes(d.name));
						if (matchedDist) {
							selectedDistrict.value = matchedDist.name;
						}
					}
				} else {
					selectedCity.value = cities.value[0]?.name || "";
					districts.value = province && selectedCity.value ? getDistrictsByCity(province, selectedCity.value) : [];
				}
				displayLocation.value = district ? `${city}${district}` : city;
			}
			emitValue();
		} catch {
			/* locate failed, silently ignore */
		} finally {
			locating.value = false;
		}
	}

	onMounted(() => {
		if (props.modelValue) return;
		try {
			const recents = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
			if (recents.length > 0) {
				const { p, c, d } = parseValue(recents[0]);
				selectedProvince.value = p;
				cities.value = p ? getCitiesByProvince(p) : [];
				selectedCity.value = c;
				districts.value = p && c ? getDistrictsByCity(p, c) : [];
				selectedDistrict.value = d;
				emit("update:modelValue", recents[0]);
			}
		} catch {
			/* ignore */
		}
	});
</script>

<style scoped>
	.cascading-city {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.cascading-city .el-select {
		width: 110px;
		flex-shrink: 0;
	}
	.locate-btn {
		height: 40px;
		flex-shrink: 0;
	}
	.cascading-city--compact {
		gap: 4px;
	}
	.cascading-city--compact .el-select {
		width: 90px;
	}
	.cascading-city--compact .locate-btn {
		padding: 8px;
		min-width: auto;
	}
	@media (max-width: 480px) {
		.cascading-city {
			gap: 4px;
		}
		.cascading-city .el-select {
			width: 80px;
		}
	}
</style>