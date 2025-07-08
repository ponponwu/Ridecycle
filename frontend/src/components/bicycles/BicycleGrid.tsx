import { useTranslation } from 'react-i18next'
import BicycleCard, { BicycleCardProps } from './BicycleCard'

interface BicycleGridProps {
    bicycles: BicycleCardProps[]
    title?: string
    viewAllLink?: string
    columns?: 3 | 4 // Support for 3-column (default) or 4-column layout
}

const BicycleGrid = ({ bicycles, title, viewAllLink, columns = 3 }: BicycleGridProps) => {
    const { t } = useTranslation()

    // Determine grid classes based on columns prop
    const gridClasses = columns === 4 
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6"

    return (
        <section className="py-8">
            {title && (
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    {viewAllLink && (
                        <a href={viewAllLink} className="text-marketplace-blue hover:underline">
                            {t('viewAll')}
                        </a>
                    )}
                </div>
            )}

            <div className={gridClasses}>
                {bicycles.map((bike) => (
                    <BicycleCard key={bike.id} {...bike} />
                ))}
            </div>
        </section>
    )
}

export default BicycleGrid
