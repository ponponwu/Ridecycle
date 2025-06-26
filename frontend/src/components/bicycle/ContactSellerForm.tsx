import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { messageService } from '@/api'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface ContactSellerFormProps {
    sellerId: string
    bicycleId: string
    currentUserName?: string
}

const ContactSellerForm = ({ sellerId, bicycleId }: ContactSellerFormProps) => {
    const [message, setMessage] = useState('')
    const [open, setOpen] = useState(false)
    const { t } = useTranslation()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const { currentUser } = useAuth()

    const handleTriggerClick = () => {
        if (!currentUser) {
            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)
            return
        }
        setOpen(true)
    }

    const handleSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!message.trim()) {
            toast({
                title: t('error'),
                description: t('messageCannotBeEmpty'),
                variant: 'destructive',
            })
            return
        }
        setIsSubmitting(true)
        try {
            await messageService.sendMessage({
                recipientId: sellerId,
                content: message,
                bicycleId: bicycleId,
            })
            setMessage('')
            toast({
                title: t('messageSent'),
                description: t('yourMessageHasBeenSuccessfullySentToTheSeller'),
            })
            setOpen(false)
            navigate(`/messages?bicycleId=${bicycleId}`)
        } catch (error) {
            console.error('Failed to send message:', error)
            toast({
                title: t('errorSendingMessage'),
                description: error instanceof Error ? error.message : t('anErrorOccurredWhileSendingYourMessage'),
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-marketplace-blue hover:bg-blue-600" onClick={handleTriggerClick}>
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {t('contactSeller')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('contactSeller')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitMessage}>
                    <div className="grid gap-4 py-4">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('askQuestion')}
                            className="w-full"
                            rows={4}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                t('sending') + '...'
                            ) : (
                                <>
                                    <MessageCircle className="mr-2 h-5 w-5" />
                                    {t('sendMessage')}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default ContactSellerForm
