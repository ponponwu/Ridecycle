/**
 * 搜尋功能相關的常數定義
 */

// 價格範圍常數（新台幣）
export const PRICE_RANGE_OPTIONS = [
    { value: '0-10000', key: 'priceRangeOptions.under10k' },
    { value: '10000-30000', key: 'priceRangeOptions.10k-30k' },
    { value: '30000-50000', key: 'priceRangeOptions.30k-50k' },
    { value: '50000-100000', key: 'priceRangeOptions.50k-100k' },
    { value: '100000-200000', key: 'priceRangeOptions.100k-200k' },
    { value: '200000-300000', key: 'priceRangeOptions.200k-300k' },
    { value: '300000+', key: 'priceRangeOptions.over300k' },
] as const

// 自行車類型選項（僅公路車和登山車）
export const BICYCLE_TYPE_OPTIONS = [
    { value: 'roadbike', key: 'bicycleTypeOptions.roadBike' },
    { value: 'mountainbike', key: 'bicycleTypeOptions.mountainBike' },
] as const

// 品牌選項
export const BRAND_OPTIONS = [
    { value: 'giant', key: 'brandOptions.giant' },
    { value: 'merida', key: 'brandOptions.merida' },
    { value: 'specialized', key: 'brandOptions.specialized' },
    { value: 'trek', key: 'brandOptions.trek' },
    { value: 'cannondale', key: 'brandOptions.cannondale' },
    { value: 'scott', key: 'brandOptions.scott' },
] as const

// 台灣地區選項
export const LOCATION_OPTIONS = [
    { value: 'taipei', key: 'locationOptions.taipei' },
    { value: 'newTaipei', key: 'locationOptions.newTaipei' },
    { value: 'taoyuan', key: 'locationOptions.taoyuan' },
    { value: 'taichung', key: 'locationOptions.taichung' },
    { value: 'tainan', key: 'locationOptions.tainan' },
    { value: 'kaohsiung', key: 'locationOptions.kaohsiung' },
] as const

// 價格範圍滑桿設定
export const PRICE_SLIDER_CONFIG = {
    min: 0,
    max: 300000,
    step: 5000,
    defaultValue: [0, 300000],
} as const
