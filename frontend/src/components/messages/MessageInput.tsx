import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MakeOfferPopover from '@/components/messages/MakeOfferPopover'

interface MessageInputProps {
    onSendMessage: (message: string) => void
    onMakeOffer: (amount: number) => void
    showOfferPopover: boolean
    toggleOfferPopover: () => void
    originalPrice: number
    isOwnBicycle?: boolean
    bicycleStatus?: string
}

const MessageInput = ({
    onSendMessage,
    onMakeOffer,
    showOfferPopover,
    toggleOfferPopover,
    originalPrice,
    isOwnBicycle = false,
    bicycleStatus = 'available',
}: MessageInputProps) => {
    const { t } = useTranslation()
    const [newMessage, setNewMessage] = useState('')

    const isBicycleUnavailable = bicycleStatus !== 'available'

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (newMessage.trim()) {
            onSendMessage(newMessage)
            setNewMessage('')
        }
    }

    const handleOfferClick = () => {
        if (isOwnBicycle || isBicycleUnavailable) {
            return
        }
        toggleOfferPopover()
    }

    return (
        <div className="p-4 border-t bg-white">
            {showOfferPopover ? (
                <MakeOfferPopover originalPrice={originalPrice} onCancel={toggleOfferPopover} onSubmit={onMakeOffer} />
            ) : (
                <>
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('typeMessage')}
                            className="flex-grow"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => {}}>
                            <Camera className="h-5 w-5" />
                        </Button>
                        <Button type="submit">
                            <Send className="h-4 w-4 mr-2" />
                            {t('send')}
                        </Button>
                    </form>

                    <div className="flex justify-center mt-4">
                        <Button
                            variant="outline"
                            className={`w-full ${
                                isOwnBicycle || isBicycleUnavailable ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={handleOfferClick}
                            disabled={isOwnBicycle || isBicycleUnavailable}
                        >
                            {isOwnBicycle ? t('messagesPage.thisIsYourBicycle') : isBicycleUnavailable ? t('messagesPage.soldOut') : t('makeAnOffer')}
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

export default MessageInput
