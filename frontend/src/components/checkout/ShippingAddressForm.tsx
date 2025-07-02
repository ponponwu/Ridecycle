import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IShippingInfo } from '@/types/checkout.types'
import { useTwZipCode, cities, districts } from 'use-tw-zipcode'
import { validateTaiwanMobile, validatePostalCode } from '@/utils/validationUtils'

// 台灣地址表單驗證 schema
const createAddressSchema = (t: any) =>
    z.object({
        fullName: z
            .string()
            .min(2, { message: t('validation.nameTooShort') })
            .max(50, { message: '姓名不能超過50個字元' }),
        phoneNumber: z
            .string()
            .min(1, { message: t('validation.required') })
            .refine(validateTaiwanMobile, { message: t('validation.phoneNumberFormat') }),
        city: z.string().min(1, { message: t('validation.required') }),
        district: z.string().min(1, { message: t('validation.required') }),
        addressLine1: z
            .string()
            .min(5, { message: t('validation.addressTooShort') })
            .max(100, { message: '地址不能超過100個字元' }),
        addressLine2: z.string().optional(),
        postalCode: z
            .string()
            .min(1, { message: t('validation.required') })
            .refine(validatePostalCode, { message: t('validation.postalCodeFormat') }),
        deliveryNotes: z.string().optional(),
    })

interface ShippingAddressFormProps {
    initialValues?: Partial<IShippingInfo>
    onSubmit: (data: IShippingInfo) => void
}

const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({ initialValues = {}, onSubmit }) => {
    const { t } = useTranslation()
    const { city, district, zipCode, handleCityChange, handleDistrictChange } = useTwZipCode()

    const addressSchema = createAddressSchema(t)

    const form = useForm<IShippingInfo>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            fullName: initialValues.fullName || '',
            phoneNumber: initialValues.phoneNumber || '',
            city: initialValues.city || '',
            district: initialValues.district || '',
            addressLine1: initialValues.addressLine1 || '',
            addressLine2: initialValues.addressLine2 || '',
            postalCode: initialValues.postalCode || '',
            deliveryNotes: initialValues.deliveryNotes || '',
        },
    })

    // 同步 use-tw-zipcode 的狀態到 react-hook-form
    useEffect(() => {
        if (city) {
            form.setValue('city', city)
        }
    }, [city, form])

    useEffect(() => {
        if (district) {
            form.setValue('district', district)
        }
    }, [district, form])

    useEffect(() => {
        if (zipCode) {
            form.setValue('postalCode', zipCode)
        }
    }, [zipCode, form])

    // 當使用者選擇城市時的處理函數
    const handleCitySelect = (selectedCity: string) => {
        handleCityChange(selectedCity)
        form.setValue('city', selectedCity)
        // 清空區域選擇
        form.setValue('district', '')
        form.setValue('postalCode', '')
    }

    // 當使用者選擇區域時的處理函數
    const handleDistrictSelect = (selectedDistrict: string) => {
        handleDistrictChange(selectedDistrict)
        form.setValue('district', selectedDistrict)
    }

    // 格式化手機號碼輸入
    const formatPhoneNumber = (value: string) => {
        const cleanValue = value.replace(/\D/g, '')
        if (cleanValue.length <= 10) {
            return cleanValue.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3')
        }
        return value
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">{t('shippingAddress')}</h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* 收件人姓名 */}
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('recipientName')} *</FormLabel>
                                <FormControl>
                                    <Input placeholder="請輸入收件人姓名" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 聯絡電話 */}
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('mobileNumber')} *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="09XX-XXX-XXX"
                                        {...field}
                                        onChange={(e) => {
                                            const formatted = formatPhoneNumber(e.target.value)
                                            field.onChange(formatted.replace(/-/g, ''))
                                        }}
                                        maxLength={12}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 縣市和鄉鎮區 */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('city')} *</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value)
                                            handleCitySelect(value)
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="選擇縣市" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {cities.map((cityName, index) => (
                                                <SelectItem key={index} value={cityName}>
                                                    {cityName}
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
                            name="district"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('district')} *</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value)
                                            handleDistrictSelect(value)
                                        }}
                                        value={field.value}
                                        disabled={!city}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="選擇鄉鎮區" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {city && districts[city]?.map((districtName, index) => (
                                                <SelectItem key={index} value={districtName}>
                                                    {districtName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* 郵遞區號 */}
                    <div className="grid grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('postalCode')} *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="100" {...field} maxLength={5} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* 詳細地址 */}
                    <FormField
                        control={form.control}
                        name="addressLine1"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('addressLine1')} *</FormLabel>
                                <FormControl>
                                    <Input placeholder="請輸入詳細地址（路、街、巷、弄、號）" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 地址補充 */}
                    <FormField
                        control={form.control}
                        name="addressLine2"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('addressLine2')}</FormLabel>
                                <FormControl>
                                    <Input placeholder="樓層、室號等補充資訊（選填）" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 配送備註 */}
                    <FormField
                        control={form.control}
                        name="deliveryNotes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('deliveryNotes')}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="特殊配送需求或備註（選填）"
                                        className="min-h-20"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 提交按鈕 */}
                    <div className="flex justify-end mt-6">
                        <Button type="submit" className="min-w-40">
                            {t('continueToPayment')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default ShippingAddressForm
