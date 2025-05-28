import React from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { BicycleWithOwner } from '@/types/bicycle.types'
import BicycleTableLoading from './BicycleTableLoading'
import EmptyBicycleState from './EmptyBicycleState'
import BicycleTable from './BicycleTable'
import { BicycleStatus } from '../hooks/useBicycleManagement'

interface BicycleTabsContentProps {
    status: BicycleStatus
    bicycles: BicycleWithOwner[]
    loading: boolean
    onApprove: (id: string) => void
    onReject: (id: string) => void
}

const BicycleTabsContent: React.FC<BicycleTabsContentProps> = ({ status, bicycles, loading, onApprove, onReject }) => {
    return (
        <TabsContent value={status} className="focus-visible:outline-none focus-visible:ring-0">
            <BicycleTableLoading loading={loading} />

            <EmptyBicycleState status={status} isEmpty={!loading && (!bicycles || bicycles.length === 0)} />

            {!loading && bicycles && bicycles.length > 0 && (
                <BicycleTable bicycles={bicycles} onApprove={onApprove} onReject={onReject} />
            )}
        </TabsContent>
    )
}

export default BicycleTabsContent
