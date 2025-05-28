
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, User, Phone } from 'lucide-react';

const phoneVerificationSchema = z.object({
  userId: z.string().min(1, {
    message: "用戶 ID 是必填的",
  }),
  phoneNumber: z.string().min(8, {
    message: "請輸入有效的電話號碼",
  }),
});

const verifyOtpSchema = z.object({
  userId: z.string().min(1),
  otp: z.string().length(6, {
    message: "OTP 必須是 6 位數",
  }),
});

type PhoneVerificationFormValues = z.infer<typeof phoneVerificationSchema>;
type OtpVerificationFormValues = z.infer<typeof verifyOtpSchema>;

const PhoneVerificationManagement: React.FC = () => {
  const { t } = useTranslation();
  const [verificationSent, setVerificationSent] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  
  const phoneForm = useForm<PhoneVerificationFormValues>({
    resolver: zodResolver(phoneVerificationSchema),
    defaultValues: {
      userId: '',
      phoneNumber: '',
    },
  });

  const otpForm = useForm<OtpVerificationFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      userId: '',
      otp: '',
    },
  });

  const onSendVerification = (data: PhoneVerificationFormValues) => {
    // In a real implementation, this would send an OTP to the user's phone
    console.log('Sending verification to:', data);
    setCurrentUserId(data.userId);
    otpForm.setValue('userId', data.userId);
    toast({
      title: t('verificationCodeSent'),
      description: t('verificationCodeSentDescription'),
    });
    setVerificationSent(true);
  };

  const onVerifyOtp = (data: OtpVerificationFormValues) => {
    // In a real implementation, this would verify the OTP against the backend
    console.log('Verifying OTP:', data);
    toast({
      title: t('phoneVerified'),
      description: t('phoneVerifiedDescription'),
    });
    // Reset the forms
    setVerificationSent(false);
    phoneForm.reset();
    otpForm.reset();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('phoneVerification')}</h1>
        <p className="text-gray-500">{t('managePhoneVerification')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('sendVerificationCode')}</CardTitle>
            <CardDescription>{t('sendVerificationCodeDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onSendVerification)} className="space-y-4">
                <FormField
                  control={phoneForm.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('userId')}</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">
                            <User className="h-5 w-5" />
                          </span>
                          <Input placeholder="d290f1ee-6c54-4b01-90e6-d701748f0851" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>{t('enterUserIdDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phoneNumber')}</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">
                            <Phone className="h-5 w-5" />
                          </span>
                          <Input placeholder="+886 912345678" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>{t('enterPhoneNumberDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  {t('sendVerificationCode')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className={verificationSent ? 'border-green-500' : ''}>
          <CardHeader>
            <CardTitle>{t('verifyCode')}</CardTitle>
            <CardDescription>{t('verifyCodeDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
                <FormField
                  control={otpForm.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('userId')}</FormLabel>
                      <FormControl>
                        <Input value={currentUserId} disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('verificationCode')}</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          render={({ slots }) => (
                            <InputOTPGroup>
                              {slots.map((slot, index) => (
                                <InputOTPSlot key={index} {...slot} index={index} />
                              ))}
                            </InputOTPGroup>
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>{t('enterVerificationCodeDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={!verificationSent}>
                  <Check className="mr-2 h-4 w-4" /> {t('verifyCode')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhoneVerificationManagement;
