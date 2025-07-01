import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SellBikeFormValues } from './types'
import { useTranslation } from 'react-i18next'

interface PricingLocationStepProps {
    form: UseFormReturn<SellBikeFormValues>
}

const PricingLocationStep = ({ form }: PricingLocationStepProps) => {
    const { t } = useTranslation()
    
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">{t('pricingAndLocation')}</h2>
                <p className="text-sm text-gray-500">{t('setAskingPriceAndLocation')}</p>
            </div>

            <FormField
                control={form.control}
                name="originalPrice"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('originalPrice')}</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                    $
                                </span>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    className="pl-6"
                                    placeholder={t('originalPricePlaceholder')}
                                    {...field}
                                />
                            </div>
                        </FormControl>
                        <FormDescription>{t('originalPriceDescription')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('salePrice')}</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                    $
                                </span>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    className="pl-6"
                                    placeholder={t('pricePlaceholder')}
                                    {...field}
                                />
                            </div>
                        </FormControl>
                        <FormDescription>{t('salePriceDescription')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('locationLabel')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('locationPlaceholder')} {...field} />
                        </FormControl>
                        <FormDescription>{t('locationDescription')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="contactMethod"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>{t('contactMethodLabel')}</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                            >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="app" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">{t('inAppMessagingOption')}</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="email" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">{t('emailOption')}</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="phone" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">{t('phoneCallOption')}</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="text" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">{t('textMessageOption')}</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}

export default PricingLocationStep
