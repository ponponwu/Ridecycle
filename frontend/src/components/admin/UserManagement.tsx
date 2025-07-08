import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Eye, Ban, AlertTriangle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { adminService } from '@/services/admin.service'
import AdminLayout from '@/components/admin/AdminLayout'

interface User {
    id: number
    fullName: string
    name: string
    email: string
    avatarUrl?: string
    admin: boolean
    createdAt: string
    updatedAt: string
    bicyclesCount: number
    messagesCount: number
    isBlacklisted: boolean
    phoneVerified: boolean
    isSuspicious?: boolean
}

const UserManagement: React.FC = () => {
    const { t } = useTranslation()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const { users } = await adminService.getUsers()
            setUsers(users)
        } catch (error) {
            console.error('Error fetching users:', error)
            toast({
                variant: 'destructive',
                title: t('error'),
                description: 'Failed to fetch users',
            })
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return t('notAvailable')

        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) {
                console.warn('Invalid date string:', dateString)
                return t('notAvailable')
            }
            return date.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            })
        } catch (error) {
            console.error('Date formatting error:', error)
            return t('notAvailable')
        }
    }

    const toggleBlacklist = async (userId: number, currentStatus: boolean) => {
        try {
            await adminService.toggleUserBlacklist(userId)

            // Update the local state
            setUsers(users.map((user) => (user.id === userId ? { ...user, isBlacklisted: !currentStatus } : user)))

            toast({
                title: !currentStatus ? '用戶已加入黑名單' : '用戶已移出黑名單',
                description: !currentStatus ? '此用戶已被加入黑名單' : '此用戶已移出黑名單',
            })
        } catch (error) {
            console.error('Error updating blacklist status:', error)
            toast({
                variant: 'destructive',
                title: t('error'),
                description: '更新黑名單狀態失敗',
            })
        }
    }

    const toggleSuspicious = async (userId: number, currentStatus: boolean) => {
        try {
            await adminService.toggleUserSuspicious(userId)

            // Update the local state
            setUsers(users.map((user) => (user.id === userId ? { ...user, isSuspicious: !currentStatus } : user)))

            toast({
                title: !currentStatus ? '用戶已標記為可疑' : '用戶已取消可疑標記',
                description: !currentStatus ? '此用戶已被標記為可疑用戶' : '此用戶已取消可疑標記',
            })
        } catch (error) {
            console.error('Error updating suspicious status:', error)
            toast({
                variant: 'destructive',
                title: t('error'),
                description: '更新可疑狀態失敗',
            })
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('userManagement')}</h1>
                <p className="text-gray-500">{t('viewAndManageUsers')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('allUsers')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('user')}</TableHead>
                                    <TableHead>{t('joinDate')}</TableHead>
                                    <TableHead>{t('bicycles')}</TableHead>
                                    <TableHead>{t('messages')}</TableHead>
                                    <TableHead>{t('status')}</TableHead>
                                    <TableHead>{t('actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    {user.avatarUrl ? (
                                                        <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                                                    ) : (
                                                        <AvatarFallback>
                                                            {user.fullName?.charAt(0) || 'U'}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                                <div>
                                                    <span>{user.fullName || user.name || t('unnamed')}</span>
                                                    {user.phoneVerified && (
                                                        <Badge
                                                            variant="outline"
                                                            className="ml-2 bg-green-50 text-green-700 border-green-200"
                                                        >
                                                            {t('phoneVerified')}
                                                        </Badge>
                                                    )}
                                                    {user.isSuspicious && (
                                                        <Badge
                                                            variant="outline"
                                                            className="ml-2 bg-orange-50 text-orange-700 border-orange-200"
                                                        >
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            {t('suspiciousUser')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                                        <TableCell>{user.bicyclesCount}</TableCell>
                                        <TableCell>{user.messagesCount}</TableCell>
                                        <TableCell>
                                            {user.isBlacklisted ? (
                                                <Badge variant="destructive">{t('blacklisted')}</Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-green-50 text-green-700 border-green-200"
                                                >
                                                    {t('active')}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        toast({
                                                            title: t('featureNotAvailable'),
                                                            description: t('userProfileViewingComingSoon'),
                                                        })
                                                    }
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    {t('view')}
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        toast({
                                                            title: t('featureNotAvailable'),
                                                            description: t('userMessageViewingComingSoon'),
                                                        })
                                                    }
                                                >
                                                    <MessageCircle className="h-4 w-4 mr-1" />
                                                    {t('messages')}
                                                </Button>

                                                <Button
                                                    variant={user.isSuspicious ? 'outline' : 'secondary'}
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleSuspicious(user.id, user.isSuspicious || false)
                                                    }
                                                    className={
                                                        user.isSuspicious
                                                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                                                            : ''
                                                    }
                                                >
                                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                                    {user.isSuspicious ? t('removeSuspicious') : t('markSuspicious')}
                                                </Button>

                                                <Button
                                                    variant={user.isBlacklisted ? 'outline' : 'destructive'}
                                                    size="sm"
                                                    onClick={() => toggleBlacklist(user.id, user.isBlacklisted)}
                                                >
                                                    <Ban className="h-4 w-4 mr-1" />
                                                    {user.isBlacklisted ? t('unblacklist') : t('blacklist')}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4">
                                            {t('noUsers')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            </div>
        </AdminLayout>
    )
}

export default UserManagement
