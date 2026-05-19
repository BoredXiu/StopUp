export interface District {
	name: string;
}

export interface City {
	name: string;
	districts: District[];
}

export interface Province {
	name: string;
	cities: City[];
}

const REGION_DATA: Province[] = [
	{
		name: "全国",
		cities: [{ name: "不限", districts: [{ name: "不限" }] }],
	},
	{
		name: "北京市",
		cities: [
			{
				name: "北京市",
				districts: [
					{ name: "不限" },
					{ name: "东城区" },
					{ name: "西城区" },
					{ name: "朝阳区" },
					{ name: "海淀区" },
					{ name: "丰台区" },
					{ name: "石景山区" },
					{ name: "通州区" },
					{ name: "大兴区" },
					{ name: "顺义区" },
					{ name: "房山区" },
					{ name: "昌平区" },
					{ name: "密云区" },
					{ name: "延庆区" },
					{ name: "平谷区" },
					{ name: "怀柔区" },
					{ name: "门头沟区" },
				],
			},
		],
	},
	{
		name: "上海市",
		cities: [
			{
				name: "上海市",
				districts: [
					{ name: "不限" },
					{ name: "黄浦区" },
					{ name: "徐汇区" },
					{ name: "长宁区" },
					{ name: "静安区" },
					{ name: "普陀区" },
					{ name: "虹口区" },
					{ name: "杨浦区" },
					{ name: "浦东新区" },
					{ name: "闵行区" },
					{ name: "宝山区" },
					{ name: "嘉定区" },
					{ name: "松江区" },
					{ name: "青浦区" },
					{ name: "奉贤区" },
					{ name: "金山区" },
					{ name: "崇明区" },
				],
			},
		],
	},
	{
		name: "天津市",
		cities: [
			{
				name: "天津市",
				districts: [
					{ name: "不限" },
					{ name: "和平区" },
					{ name: "河东区" },
					{ name: "河西区" },
					{ name: "南开区" },
					{ name: "河北区" },
					{ name: "红桥区" },
					{ name: "东丽区" },
					{ name: "西青区" },
					{ name: "津南区" },
					{ name: "北辰区" },
					{ name: "武清区" },
					{ name: "宝坻区" },
					{ name: "宁河区" },
					{ name: "静海区" },
					{ name: "蓟州区" },
					{ name: "滨海新区" },
				],
			},
		],
	},
	{
		name: "重庆市",
		cities: [
			{
				name: "重庆市",
				districts: [
					{ name: "不限" },
					{ name: "渝中区" },
					{ name: "江北区" },
					{ name: "南岸区" },
					{ name: "沙坪坝区" },
					{ name: "九龙坡区" },
					{ name: "大渡口区" },
					{ name: "渝北区" },
					{ name: "巴南区" },
					{ name: "北碚区" },
					{ name: "万州区" },
					{ name: "涪陵区" },
					{ name: "黔江区" },
					{ name: "长寿区" },
					{ name: "江津区" },
					{ name: "合川区" },
					{ name: "永川区" },
					{ name: "璧山区" },
					{ name: "铜梁区" },
					{ name: "潼南区" },
					{ name: "荣昌区" },
				],
			},
		],
	},
	{
		name: "广东省",
		cities: [
			{
				name: "不限",
				districts: [{ name: "不限" }],
			},
			{
				name: "广州市",
				districts: [
					{ name: "不限" },
					{ name: "越秀区" },
					{ name: "海珠区" },
					{ name: "荔湾区" },
					{ name: "天河区" },
					{ name: "白云区" },
					{ name: "黄埔区" },
					{ name: "番禺区" },
					{ name: "花都区" },
					{ name: "南沙区" },
					{ name: "从化区" },
					{ name: "增城区" },
				],
			},
			{
				name: "深圳市",
				districts: [
					{ name: "不限" },
					{ name: "福田区" },
					{ name: "罗湖区" },
					{ name: "南山区" },
					{ name: "宝安区" },
					{ name: "龙岗区" },
					{ name: "龙华区" },
					{ name: "光明区" },
					{ name: "坪山区" },
					{ name: "盐田区" },
					{ name: "大鹏新区" },
				],
			},
			{
				name: "东莞市",
				districts: [
					{ name: "不限" },
					{ name: "莞城街道" },
					{ name: "东城街道" },
					{ name: "南城街道" },
					{ name: "万江街道" },
					{ name: "虎门镇" },
					{ name: "长安镇" },
					{ name: "厚街镇" },
					{ name: "大朗镇" },
					{ name: "塘厦镇" },
					{ name: "常平镇" },
				],
			},
			{
				name: "佛山市",
				districts: [
					{ name: "不限" },
					{ name: "禅城区" },
					{ name: "南海区" },
					{ name: "顺德区" },
					{ name: "高明区" },
					{ name: "三水区" },
				],
			},
		],
	},
	{
		name: "浙江省",
		cities: [
			{
				name: "不限",
				districts: [{ name: "不限" }],
			},
			{
				name: "杭州市",
				districts: [
					{ name: "不限" },
					{ name: "上城区" },
					{ name: "拱墅区" },
					{ name: "西湖区" },
					{ name: "滨江区" },
					{ name: "萧山区" },
					{ name: "余杭区" },
					{ name: "临平区" },
					{ name: "钱塘区" },
					{ name: "富阳区" },
					{ name: "临安区" },
					{ name: "桐庐县" },
					{ name: "淳安县" },
					{ name: "建德市" },
				],
			},
			{
				name: "宁波市",
				districts: [
					{ name: "不限" },
					{ name: "海曙区" },
					{ name: "江北区" },
					{ name: "北仑区" },
					{ name: "镇海区" },
					{ name: "鄞州区" },
					{ name: "奉化区" },
					{ name: "余姚市" },
					{ name: "慈溪市" },
					{ name: "象山县" },
					{ name: "宁海县" },
				],
			},
		],
	},
	{
		name: "江苏省",
		cities: [
			{
				name: "不限",
				districts: [{ name: "不限" }],
			},
			{
				name: "南京市",
				districts: [
					{ name: "不限" },
					{ name: "玄武区" },
					{ name: "秦淮区" },
					{ name: "建邺区" },
					{ name: "鼓楼区" },
					{ name: "浦口区" },
					{ name: "栖霞区" },
					{ name: "雨花台区" },
					{ name: "江宁区" },
					{ name: "六合区" },
					{ name: "溧水区" },
					{ name: "高淳区" },
				],
			},
			{
				name: "苏州市",
				districts: [
					{ name: "不限" },
					{ name: "姑苏区" },
					{ name: "吴中区" },
					{ name: "相城区" },
					{ name: "吴江区" },
					{ name: "虎丘区" },
					{ name: "常熟市" },
					{ name: "张家港市" },
					{ name: "昆山市" },
					{ name: "太仓市" },
				],
			},
		],
	},
	{
		name: "四川省",
		cities: [
			{
				name: "不限",
				districts: [{ name: "不限" }],
			},
			{
				name: "成都市",
				districts: [
					{ name: "不限" },
					{ name: "锦江区" },
					{ name: "青羊区" },
					{ name: "金牛区" },
					{ name: "武侯区" },
					{ name: "成华区" },
					{ name: "龙泉驿区" },
					{ name: "青白江区" },
					{ name: "新都区" },
					{ name: "温江区" },
					{ name: "双流区" },
					{ name: "郫都区" },
					{ name: "新津区" },
					{ name: "都江堰市" },
					{ name: "彭州市" },
					{ name: "邛崃市" },
					{ name: "崇州市" },
					{ name: "简阳市" },
					{ name: "金堂县" },
					{ name: "大邑县" },
					{ name: "蒲江县" },
				],
			},
		],
	},
	{
		name: "湖北省",
		cities: [
			{
				name: "不限",
				districts: [{ name: "不限" }],
			},
			{
				name: "武汉市",
				districts: [
					{ name: "不限" },
					{ name: "江岸区" },
					{ name: "江汉区" },
					{ name: "硚口区" },
					{ name: "汉阳区" },
					{ name: "武昌区" },
					{ name: "洪山区" },
					{ name: "青山区" },
					{ name: "东西湖区" },
					{ name: "汉南区" },
					{ name: "蔡甸区" },
					{ name: "江夏区" },
					{ name: "黄陂区" },
					{ name: "新洲区" },
				],
			},
		],
	},
	{
		name: "陕西省",
		cities: [
			{
				name: "不限",
				districts: [{ name: "不限" }],
			},
			{
				name: "西安市",
				districts: [
					{ name: "不限" },
					{ name: "新城区" },
					{ name: "碑林区" },
					{ name: "莲湖区" },
					{ name: "灞桥区" },
					{ name: "未央区" },
					{ name: "雁塔区" },
					{ name: "阎良区" },
					{ name: "临潼区" },
					{ name: "长安区" },
					{ name: "高陵区" },
					{ name: "鄠邑区" },
					{ name: "蓝田县" },
					{ name: "周至县" },
				],
			},
		],
	},
	{
		name: "湖南省",
		cities: [
			{
				name: "不限",
				districts: [{ name: "不限" }],
			},
			{
				name: "长沙市",
				districts: [
					{ name: "不限" },
					{ name: "芙蓉区" },
					{ name: "天心区" },
					{ name: "岳麓区" },
					{ name: "开福区" },
					{ name: "雨花区" },
					{ name: "望城区" },
					{ name: "长沙县" },
					{ name: "浏阳市" },
					{ name: "宁乡市" },
				],
			},
		],
	},
	{
		name: "河南省",
		cities: [
			{
				name: "不限",
				districts: [{ name: "不限" }],
			},
			{
				name: "郑州市",
				districts: [
					{ name: "不限" },
					{ name: "中原区" },
					{ name: "二七区" },
					{ name: "管城回族区" },
					{ name: "金水区" },
					{ name: "上街区" },
					{ name: "惠济区" },
					{ name: "巩义市" },
					{ name: "荥阳市" },
					{ name: "新密市" },
					{ name: "新郑市" },
					{ name: "登封市" },
					{ name: "中牟县" },
				],
			},
		],
	},
	{
		name: "山东省",
		cities: [
			{
				name: "不限",
				districts: [{ name: "不限" }],
			},
			{
				name: "青岛市",
				districts: [
					{ name: "不限" },
					{ name: "市南区" },
					{ name: "市北区" },
					{ name: "黄岛区" },
					{ name: "崂山区" },
					{ name: "李沧区" },
					{ name: "城阳区" },
					{ name: "即墨区" },
					{ name: "胶州市" },
					{ name: "平度市" },
					{ name: "莱西市" },
				],
			},
		],
	},
	{
		name: "福建省",
		cities: [
			{
				name: "不限",
				districts: [{ name: "不限" }],
			},
			{
				name: "厦门市",
				districts: [
					{ name: "不限" },
					{ name: "思明区" },
					{ name: "湖里区" },
					{ name: "集美区" },
					{ name: "海沧区" },
					{ name: "同安区" },
					{ name: "翔安区" },
				],
			},
		],
	},
	{
		name: "安徽省",
		cities: [
			{
				name: "不限",
				districts: [{ name: "不限" }],
			},
			{
				name: "合肥市",
				districts: [
					{ name: "不限" },
					{ name: "瑶海区" },
					{ name: "庐阳区" },
					{ name: "蜀山区" },
					{ name: "包河区" },
					{ name: "肥东县" },
					{ name: "肥西县" },
					{ name: "长丰县" },
					{ name: "庐江县" },
					{ name: "巢湖市" },
				],
			},
		],
	},
];

export function getProvinces(): Province[] {
	return REGION_DATA;
}

export function getCitiesByProvince(provinceName: string): City[] {
	const province = REGION_DATA.find((p) => p.name === provinceName);
	return province?.cities || [];
}

export function getDistrictsByCity(provinceName: string, cityName: string): District[] {
	const cities = getCitiesByProvince(provinceName);
	const city = cities.find((c) => c.name === cityName);
	return city?.districts || [];
}

export function findRegion(provinceName: string, cityName: string, districtName: string): { province: string; city: string; district: string } | null {
	const province = REGION_DATA.find((p) => p.name === provinceName);
	if (!province) return null;
	const city = province.cities.find((c) => c.name === cityName);
	if (!city) return null;
	const district = city.districts.find((d) => d.name === districtName);
	if (!district) return null;
	return { province: provinceName, city: cityName, district: districtName };
}