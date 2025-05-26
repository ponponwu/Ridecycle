import React, { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchSelect } from '@/components/ui/search-select'
import { Button } from '@/components/ui/button'
import { SellBikeFormValues } from './types'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { BicycleType, BICYCLE_TYPES } from '@/types/bicycle.types'
import useCatalogData from '@/hooks/useCatalogData'

// Generate years from 2017 to current year
const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2015 }, (_, i) => (currentYear - i).toString())

// Frame sizes
const frameSizes = [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    '48cm',
    '50cm',
    '52cm',
    '54cm',
    '56cm',
    '58cm',
    '13"',
    '15"',
    '17"',
    '19"',
    '21"',
]

interface BasicDetailsStepProps {
    form: UseFormReturn<SellBikeFormValues>
}

const BasicDetailsStep = ({ form }: BasicDetailsStepProps) => {
    const { brands, transmissions, isLoading } = useCatalogData()
    const { t } = useTranslation()

    // 設置默認的自行車類型為 Road
    useEffect(() => {
        if (!form.getValues('bicycleType')) {
            form.setValue('bicycleType', BicycleType.ROAD)
        }
    }, [form])

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">{t('bikeDetails')}</h2>
                <p className="text-sm text-gray-500">{t('provideBasicBikeInfo')}</p>
            </div>

            {/* 自行車類型選擇（按鈕方式） */}
            <FormField
                control={form.control}
                name="bicycleType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('bicycleType')}</FormLabel>
                        <div className="flex gap-4">
                            {BICYCLE_TYPES.map((type) => (
                                <Button
                                    key={type.value}
                                    type="button"
                                    variant={field.value === type.value ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => form.setValue('bicycleType', type.value)}
                                >
                                    {t(type.translationKey)}
                                </Button>
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('listingTitle')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('titlePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 品牌選擇（使用 SearchSelect） */}
                <FormField
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('brand')}</FormLabel>
                            <FormControl>
                                {isLoading ? (
                                    <div className="flex h-10 items-center px-3 py-2 border rounded-md">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span className="text-sm text-muted-foreground">{t('loading')}</span>
                                    </div>
                                ) : (
                                    <SearchSelect
                                        options={brands}
                                        value={field.value}
                                        onChange={(value, option) => {
                                            field.onChange(value)
                                            form.setValue('brandName', option?.label)
                                        }}
                                        placeholder={t('brandPlaceholder')}
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* 變速系統選擇（使用 SearchSelect） */}
                <FormField
                    control={form.control}
                    name="transmissionId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('transmissionSystem')}</FormLabel>
                            <FormControl>
                                {isLoading ? (
                                    <div className="flex h-10 items-center px-3 py-2 border rounded-md">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span className="text-sm text-muted-foreground">{t('loading')}</span>
                                    </div>
                                ) : (
                                    <SearchSelect
                                        options={transmissions}
                                        value={field.value}
                                        onChange={(value, option) => {
                                            field.onChange(value)
                                            form.setValue('transmissionName', option?.label)
                                        }}
                                        placeholder={t('selectTransmissionSystem')}
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('year')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectYear')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="frameSize"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('frameSize')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectFrameSize')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {frameSizes.map((size) => (
                                        <SelectItem key={size} value={size}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('description')}</FormLabel>
                        <FormControl>
                            <Textarea placeholder={t('descriptionPlaceholder')} className="min-h-32" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}

export default BasicDetailsStep
