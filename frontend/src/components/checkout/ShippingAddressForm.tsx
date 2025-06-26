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
import {
    taiwanCounties,
    getDistrictsByCounty,
    validateTaiwanMobile,
    validatePostalCode,
} from '@/utils/taiwanAddressData'

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
        county: z.string().min(1, { message: t('validation.required') }),
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
    const [selectedCounty, setSelectedCounty] = useState(initialValues.county || '')
    const [availableDistricts, setAvailableDistricts] = useState<any[]>([])

    const addressSchema = createAddressSchema(t)

    const form = useForm<IShippingInfo>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            fullName: initialValues.fullName || '',
            phoneNumber: initialValues.phoneNumber || '',
            county: initialValues.county || '',
            district: initialValues.district || '',
            addressLine1: initialValues.addressLine1 || '',
            addressLine2: initialValues.addressLine2 || '',
            postalCode: initialValues.postalCode || '',
            deliveryNotes: initialValues.deliveryNotes || '',
        },
    })

    // 當縣市改變時，更新可用的鄉鎮區列表
    useEffect(() => {
        if (selectedCounty) {
            const districts = getDistrictsByCounty(selectedCounty)
            setAvailableDistricts(districts)

            // 如果當前選擇的區域不在新的列表中，清空區域選擇
            const currentDistrict = form.getValues('district')
            if (currentDistrict && !districts.find((d) => d.code === currentDistrict)) {
                form.setValue('district', '')
                form.setValue('postalCode', '')
            }
        } else {
            setAvailableDistricts([])
        }
    }, [selectedCounty, form])

    // 當鄉鎮區改變時，自動填入郵遞區號
    const handleDistrictChange = (districtCode: string) => {
        form.setValue('district', districtCode)

        const district = availableDistricts.find((d) => d.code === districtCode)
        if (district && district.postalCodes.length > 0) {
            form.setValue('postalCode', district.postalCodes[0])
        }
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
                            name="county"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('county')} *</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value)
                                            setSelectedCounty(value)
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="選擇縣市" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {taiwanCounties.map((county) => (
                                                <SelectItem key={county.code} value={county.code}>
                                                    {county.name}
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
                                        onValueChange={handleDistrictChange}
                                        value={field.value}
                                        disabled={!selectedCounty}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="選擇鄉鎮區" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableDistricts.map((district) => (
                                                <SelectItem key={district.code} value={district.code}>
                                                    {district.name}
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
