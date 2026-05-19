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

export interface Region {
  name: string
  cities: { name: string; districts: string[] }[]
}

function buildRegionData(): Region[] {
  const regions: Region[] = [
    {
      name: '全国',
      cities: [{ name: '不限', districts: ['不限'] }],
    },
  ]

  for (const p of (levelData as LevelItem[])) {
    const cities: { name: string; districts: string[] }[] = [
      { name: '不限', districts: ['不限'] },
    ]

    if (p.children?.length) {
      const isMunicipality = !p.children.some(c => c.children?.length)

      if (isMunicipality) {
        cities.push({
          name: p.name,
          districts: ['不限', ...p.children.map(d => d.name)],
        })
      } else {
        for (const cityData of p.children) {
          cities.push({
            name: cityData.name,
            districts: ['不限', ...(cityData.children || []).map(d => d.name)],
          })
        }
      }
    }

    regions.push({ name: p.name, cities })
  }

  return regions
}

const REGION_DATA: Region[] = buildRegionData()

export { REGION_DATA }
export default REGION_DATA
