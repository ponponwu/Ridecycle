
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const siteSettingsSchema = z.object({
  siteName: z.string().min(2).max(50),
  contactEmail: z.string().email(),
  enableRegistration: z.boolean().default(true),
  requireVerification: z.boolean().default(false),
  bicycleApprovalRequired: z.boolean().default(true),
});

const notificationSettingsSchema = z.object({
  adminEmail: z.string().email(),
  notifyOnNewBicycle: z.boolean().default(true),
  notifyOnNewUser: z.boolean().default(true),
  notifyOnNewMessage: z.boolean().default(false),
});

const SystemSettings: React.FC = () => {
  const { t } = useTranslation();
  
  const siteForm = useForm<z.infer<typeof siteSettingsSchema>>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      siteName: 'Pedal Palace',
      contactEmail: 'admin@pedalpalace.com',
      enableRegistration: true,
      requireVerification: false,
      bicycleApprovalRequired: true,
    },
  });
  
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      adminEmail: 'admin@pedalpalace.com',
      notifyOnNewBicycle: true,
      notifyOnNewUser: true,
      notifyOnNewMessage: false,
    },
  });
  
  const onSiteSettingsSave = (data: z.infer<typeof siteSettingsSchema>) => {
    console.log('Site settings saved:', data);
    toast({
      title: t('settingsSaved'),
      description: t('siteSettingsUpdated'),
    });
  };
  
  const onNotificationSettingsSave = (data: z.infer<typeof notificationSettingsSchema>) => {
    console.log('Notification settings saved:', data);
    toast({
      title: t('settingsSaved'),
      description: t('notificationSettingsUpdated'),
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('systemSettings')}</h1>
        <p className="text-gray-500">{t('configureSystemSettings')}</p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">{t('generalSettings')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('notificationSettings')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('siteConfiguration')}</CardTitle>
              <CardDescription>{t('configureSiteSettings')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...siteForm}>
                <form onSubmit={siteForm.handleSubmit(onSiteSettingsSave)} className="space-y-6">
                  <FormField
                    control={siteForm.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('siteName')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>{t('siteNameDescription')}</FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={siteForm.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contactEmail')}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <FormField
                      control={siteForm.control}
                      name="enableRegistration"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>{t('enableUserRegistration')}</FormLabel>
                            <FormDescription>{t('enableUserRegistrationDescription')}</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={siteForm.control}
                      name="requireVerification"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>{t('requireEmailVerification')}</FormLabel>
                            <FormDescription>{t('requireEmailVerificationDescription')}</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={siteForm.control}
                      name="bicycleApprovalRequired"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>{t('requireBicycleApproval')}</FormLabel>
                            <FormDescription>{t('requireBicycleApprovalDescription')}</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">{t('saveChanges')}</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('notificationSettings')}</CardTitle>
              <CardDescription>{t('configureNotifications')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSettingsSave)} className="space-y-6">
                  <FormField
                    control={notificationForm.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('notificationEmail')}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormDescription>{t('notificationEmailDescription')}</FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="notifyOnNewBicycle"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>{t('notifyOnNewBicycle')}</FormLabel>
                            <FormDescription>{t('notifyOnNewBicycleDescription')}</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="notifyOnNewUser"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>{t('notifyOnNewUser')}</FormLabel>
                            <FormDescription>{t('notifyOnNewUserDescription')}</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="notifyOnNewMessage"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>{t('notifyOnNewMessage')}</FormLabel>
                            <FormDescription>{t('notifyOnNewMessageDescription')}</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">{t('saveChanges')}</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
