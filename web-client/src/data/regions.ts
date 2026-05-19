// 中国行政区划完整数据 — 省/市/区
// Data from province-city-china (GB/T 2260)
import levelData from 'province-city-china/dist/level.json'

type LevelItem = {
  code: string
  name: string
  province: string
  city?: string
  area?: string
  children?: LevelItem[]
}

export interface District {
  name: string
}

export interface City {
  name: string
  districts: District[]
}

export interface Province {
  name: string
  cities: City[]
}

let _provinces: Province[] | null = null
let _provinceMap: Map<string, Province> = new Map()
let _cityDistrictsMap: Map<string, Map<string, District[]>> = new Map()

const NO_LIMIT_CITY: City = { name: '不限', districts: [{ name: '不限' }] }
const NO_LIMIT_DISTRICT: District[] = [{ name: '不限' }]

function build(): void {
  if (_provinces) return

  const provinces: Province[] = [
    { name: '全国', cities: [NO_LIMIT_CITY] },
  ]

  for (const p of (levelData as LevelItem[])) {
    const cities: City[] = [NO_LIMIT_CITY]

    if (p.children?.length) {
      const isMunicipality = !p.children.some(c => c.children?.length)

      if (isMunicipality) {
        cities.push({
          name: p.name,
          districts: [NO_LIMIT_DISTRICT[0], ...p.children.map(d => ({ name: d.name }))],
        })
      } else {
        for (const cityData of p.children) {
          cities.push({
            name: cityData.name,
            districts: [NO_LIMIT_DISTRICT[0], ...(cityData.children || []).map(d => ({ name: d.name }))],
          })
        }
      }
    }

    provinces.push({ name: p.name, cities })
  }

  _provinces = provinces
  for (const p of provinces) {
    _provinceMap.set(p.name, p)
  }
  for (const p of provinces) {
    const cityMap = new Map<string, District[]>()
    for (const c of p.cities) {
      cityMap.set(c.name, c.districts)
    }
    _cityDistrictsMap.set(p.name, cityMap)
  }
}

export function getProvinces(): Province[] {
  build()
  return _provinces!
}

export function getCitiesByProvince(provinceName: string): City[] {
  build()
  if (!provinceName || provinceName === '全国') {
    return [NO_LIMIT_CITY]
  }
  return _provinceMap.get(provinceName)?.cities || []
}

export function getDistrictsByCity(provinceName: string, cityName: string): District[] {
  build()
  if (!provinceName || !cityName || cityName === '不限') {
    return NO_LIMIT_DISTRICT
  }
  return _cityDistrictsMap.get(provinceName)?.get(cityName) || []
}

export function findRegion(keyword: string): { province: string; city: string; district: string } | null {
  if (!keyword) return null
  build()
  for (const p of _provinces!) {
    if (p.name === '全国') continue
    for (const c of p.cities) {
      if (c.name === '不限') continue
      for (const d of c.districts) {
        if (d.name !== '不限' && keyword.includes(d.name)) {
          return { province: p.name, city: c.name, district: d.name }
        }
      }
    }
  }
  for (const p of _provinces!) {
    if (p.name === '全国') continue
    for (const c of p.cities) {
      if (c.name !== '不限' && keyword.includes(c.name.replace('市', ''))) {
        return { province: p.name, city: c.name, district: '' }
      }
    }
    if (keyword.includes(p.name.replace('省', '').replace('自治区', '').replace('市', ''))) {
      return { province: p.name, city: '', district: '' }
    }
  }
  return null
}
