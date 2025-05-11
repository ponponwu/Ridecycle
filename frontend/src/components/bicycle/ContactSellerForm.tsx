import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { messageService } from '@/api'
import { useNavigate } from 'react-router-dom'

interface ContactSellerFormProps {
    sellerId: string
    bicycleId: string
    currentUserName?: string
}

const ContactSellerForm = ({ sellerId, bicycleId }: ContactSellerFormProps) => {
    const [message, setMessage] = useState('')
    const { t } = useTranslation()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

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
                recipientId: sellerId, // Changed to camelCase
                content: message,
                bicycleId: bicycleId, // Changed to camelCase
            })
            setMessage('')
            toast({
                title: t('messageSent'),
                description: t('yourMessageHasBeenSuccessfullySentToTheSeller'),
            })
            // Optionally, redirect to the messages page
            // navigate(`/messages/${sellerId}?bicycleId=${bicycleId}`);
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
        <div className="mt-8">
            <h3 className="text-lg font-medium">{t('contactSeller')}</h3>
            <form onSubmit={handleSubmitMessage} className="mt-4">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('askQuestion')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
                    rows={4}
                    required
                ></textarea>

                <Button type="submit" className="mt-4 bg-marketplace-blue hover:bg-blue-600" disabled={isSubmitting}>
                    {isSubmitting ? (
                        t('sending') + '...'
                    ) : (
                        <>
                            <MessageCircle className="mr-2 h-5 w-5" />
                            {t('sendMessage')}
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}

export default ContactSellerForm
