import { TFunction } from 'i18next'

/**
 * 翻譯自行車狀況
 * 將後端的 snake_case 狀況轉換為翻譯文字
 */
export const translateBicycleCondition = (condition: string, t: TFunction): string => {
    const conditionMap: Record<string, string> = {
        brand_new: t('conditionOptions.brandNew'),
        like_new: t('conditionOptions.likeNew'),
        excellent: t('conditionOptions.excellent'),
        good: t('conditionOptions.good'),
        fair: t('conditionOptions.fair'),
        poor: t('conditionOptions.poor'),
    }
    return conditionMap[condition] || condition
}

/**
 * 翻譯自行車類型
 * 將後端的自行車類型轉換為翻譯文字
 */
export const translateBicycleType = (bicycleType: string, t: TFunction): string => {
    const typeMap: Record<string, string> = {
        road: t('roadbike'),
        mountain: t('mountainbike'),
        hybrid: t('hybridbike'),
        city: t('citybike'),
        cruiser: t('cruiserbike'),
        electric: t('electricbike'),
        folding: t('foldingbike'),
        gravel: t('gravelbike'),
        fixed_gear: t('fixedgear'),
        bmx: t('bmx'),
        kids: t('kidsbike'),
        other: t('other'),
    }
    return typeMap[bicycleType] || bicycleType
}
