/**
 * 台灣地址資料
 * 包含縣市、鄉鎮市區等資訊
 */

export interface TaiwanCounty {
    code: string
    name: string
    districts: TaiwanDistrict[]
}

export interface TaiwanDistrict {
    code: string
    name: string
    postalCodes: string[]
}

// 台灣縣市資料
export const taiwanCounties: TaiwanCounty[] = [
    {
        code: 'taipei',
        name: '台北市',
        districts: [
            { code: 'zhongzheng', name: '中正區', postalCodes: ['100'] },
            { code: 'datong', name: '大同區', postalCodes: ['103'] },
            { code: 'zhongshan', name: '中山區', postalCodes: ['104'] },
            { code: 'songshan', name: '松山區', postalCodes: ['105'] },
            { code: 'daan', name: '大安區', postalCodes: ['106'] },
            { code: 'wanhua', name: '萬華區', postalCodes: ['108'] },
            { code: 'xinyi', name: '信義區', postalCodes: ['110'] },
            { code: 'shilin', name: '士林區', postalCodes: ['111'] },
            { code: 'beitou', name: '北投區', postalCodes: ['112'] },
            { code: 'neihu', name: '內湖區', postalCodes: ['114'] },
            { code: 'nangang', name: '南港區', postalCodes: ['115'] },
            { code: 'wenshan', name: '文山區', postalCodes: ['116'] },
        ],
    },
    {
        code: 'newTaipei',
        name: '新北市',
        districts: [
            { code: 'banqiao', name: '板橋區', postalCodes: ['220'] },
            { code: 'sanchong', name: '三重區', postalCodes: ['241'] },
            { code: 'zhonghe', name: '中和區', postalCodes: ['235'] },
            { code: 'yonghe', name: '永和區', postalCodes: ['234'] },
            { code: 'xinzhuang', name: '新莊區', postalCodes: ['242'] },
            { code: 'xindian', name: '新店區', postalCodes: ['231'] },
            { code: 'tucheng', name: '土城區', postalCodes: ['236'] },
            { code: 'luzhou', name: '蘆洲區', postalCodes: ['247'] },
            { code: 'wugu', name: '五股區', postalCodes: ['248'] },
            { code: 'taishan', name: '泰山區', postalCodes: ['243'] },
            { code: 'linkou', name: '林口區', postalCodes: ['244'] },
            { code: 'shenkeng', name: '深坑區', postalCodes: ['222'] },
        ],
    },
    {
        code: 'taoyuan',
        name: '桃園市',
        districts: [
            { code: 'taoyuan', name: '桃園區', postalCodes: ['330'] },
            { code: 'zhongli', name: '中壢區', postalCodes: ['320'] },
            { code: 'pingzhen', name: '平鎮區', postalCodes: ['324'] },
            { code: 'yangmei', name: '楊梅區', postalCodes: ['326'] },
            { code: 'longtan', name: '龍潭區', postalCodes: ['325'] },
            { code: 'xinwu', name: '新屋區', postalCodes: ['327'] },
            { code: 'guanyin', name: '觀音區', postalCodes: ['328'] },
            { code: 'dayuan', name: '大園區', postalCodes: ['337'] },
        ],
    },
    {
        code: 'taichung',
        name: '台中市',
        districts: [
            { code: 'central', name: '中區', postalCodes: ['400'] },
            { code: 'east', name: '東區', postalCodes: ['401'] },
            { code: 'south', name: '南區', postalCodes: ['402'] },
            { code: 'west', name: '西區', postalCodes: ['403'] },
            { code: 'north', name: '北區', postalCodes: ['404'] },
            { code: 'xitun', name: '西屯區', postalCodes: ['407'] },
            { code: 'nantun', name: '南屯區', postalCodes: ['408'] },
            { code: 'beitun', name: '北屯區', postalCodes: ['406'] },
            { code: 'fengyuan', name: '豐原區', postalCodes: ['420'] },
        ],
    },
    {
        code: 'tainan',
        name: '台南市',
        districts: [
            { code: 'central_west', name: '中西區', postalCodes: ['700'] },
            { code: 'east', name: '東區', postalCodes: ['701'] },
            { code: 'south', name: '南區', postalCodes: ['702'] },
            { code: 'north', name: '北區', postalCodes: ['704'] },
            { code: 'anping', name: '安平區', postalCodes: ['708'] },
            { code: 'annan', name: '安南區', postalCodes: ['709'] },
            { code: 'yongkang', name: '永康區', postalCodes: ['710'] },
            { code: 'rende', name: '仁德區', postalCodes: ['717'] },
        ],
    },
    {
        code: 'kaohsiung',
        name: '高雄市',
        districts: [
            { code: 'xinxing', name: '新興區', postalCodes: ['800'] },
            { code: 'qianjin', name: '前金區', postalCodes: ['801'] },
            { code: 'lingya', name: '苓雅區', postalCodes: ['802'] },
            { code: 'yancheng', name: '鹽埕區', postalCodes: ['803'] },
            { code: 'gushan', name: '鼓山區', postalCodes: ['804'] },
            { code: 'qijin', name: '旗津區', postalCodes: ['805'] },
            { code: 'qianzhen', name: '前鎮區', postalCodes: ['806'] },
            { code: 'sanmin', name: '三民區', postalCodes: ['807'] },
            { code: 'zuoying', name: '左營區', postalCodes: ['813'] },
        ],
    },
    {
        code: 'keelung',
        name: '基隆市',
        districts: [
            { code: 'ren2', name: '仁愛區', postalCodes: ['200'] },
            { code: 'xinyi', name: '信義區', postalCodes: ['201'] },
            { code: 'zhongzheng', name: '中正區', postalCodes: ['202'] },
            { code: 'zhongshan', name: '中山區', postalCodes: ['203'] },
            { code: 'anle', name: '安樂區', postalCodes: ['204'] },
            { code: 'nuannuan', name: '暖暖區', postalCodes: ['205'] },
            { code: 'qidu', name: '七堵區', postalCodes: ['206'] },
        ],
    },
    {
        code: 'hsinchu',
        name: '新竹市',
        districts: [
            { code: 'east', name: '東區', postalCodes: ['300'] },
            { code: 'north', name: '北區', postalCodes: ['300'] },
            { code: 'xiangshan', name: '香山區', postalCodes: ['300'] },
        ],
    },
]

// 根據縣市代碼取得鄉鎮市區列表
export const getDistrictsByCounty = (countyCode: string): TaiwanDistrict[] => {
    const county = taiwanCounties.find((c) => c.code === countyCode)
    return county ? county.districts : []
}

// 根據鄉鎮市區取得郵遞區號
export const getPostalCodesByDistrict = (countyCode: string, districtCode: string): string[] => {
    const county = taiwanCounties.find((c) => c.code === countyCode)
    if (!county) return []

    const district = county.districts.find((d) => d.code === districtCode)
    return district ? district.postalCodes : []
}

// 驗證台灣手機號碼格式
export const validateTaiwanMobile = (phone: string): boolean => {
    const mobileRegex = /^09\d{8}$/
    return mobileRegex.test(phone)
}

// 驗證台灣市話號碼格式
export const validateTaiwanLandline = (phone: string): boolean => {
    const landlineRegex = /^0\d{1,2}-?\d{6,8}$/
    return landlineRegex.test(phone)
}

// 驗證郵遞區號格式
export const validatePostalCode = (postalCode: string): boolean => {
    const postalRegex = /^\d{3,5}$/
    return postalRegex.test(postalCode)
}

// 格式化台灣手機號碼 (09XX-XXX-XXX)
export const formatTaiwanMobile = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length === 10 && cleanPhone.startsWith('09')) {
        return `${cleanPhone.slice(0, 4)}-${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`
    }
    return phone
}
