import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Bike, MessageCircle, Settings, Package } from 'lucide-react'
import { IUser } from '@/types/auth.types'
import { useTranslation } from 'react-i18next'

import PersonalInfo from './PersonalInfo'
import MyBicycles from './MyBicycles'
import Messages from './Messages'
import AccountSettings from './AccountSettings'
import OrderHistory from './OrderHistory'

interface ProfileTabsProps {
    user: IUser
    activeTab: string
    setActiveTab: (tab: string) => void
    handleSignOut: () => Promise<void>
}

const ProfileTabs = ({ user, activeTab, setActiveTab, handleSignOut }: ProfileTabsProps) => {
    const { t } = useTranslation()

    return (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-6 grid grid-cols-5">
                <TabsTrigger
                    value="personal-info"
                    className="flex flex-col items-center sm:flex-row sm:items-center gap-1"
                >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{t('personalInfo')}</span>
                </TabsTrigger>
                <TabsTrigger
                    value="my-bicycles"
                    className="flex flex-col items-center sm:flex-row sm:items-center gap-1"
                >
                    <Bike className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{t('myBicycles')}</span>
                </TabsTrigger>
                <TabsTrigger
                    value="order-history"
                    className="flex flex-col items-center sm:flex-row sm:items-center gap-1"
                >
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{t('orderHistory')}</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex flex-col items-center sm:flex-row sm:items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{t('messages')}</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex flex-col items-center sm:flex-row sm:items-center gap-1">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{t('accountSettings')}</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="personal-info" className="focus-visible:outline-none focus-visible:ring-0">
                <PersonalInfo user={user} />
            </TabsContent>

            <TabsContent value="my-bicycles" className="focus-visible:outline-none focus-visible:ring-0">
                <MyBicycles />
            </TabsContent>

            <TabsContent value="order-history" className="focus-visible:outline-none focus-visible:ring-0">
                <OrderHistory />
            </TabsContent>

            <TabsContent value="messages" className="focus-visible:outline-none focus-visible:ring-0">
                <Messages />
            </TabsContent>

            <TabsContent value="settings" className="focus-visible:outline-none focus-visible:ring-0">
                <AccountSettings onSignOut={handleSignOut} />
            </TabsContent>
        </Tabs>
    )
}

export default ProfileTabs
