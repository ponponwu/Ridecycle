import { useState, useEffect } from 'react'
import catalogService, { ICatalogData } from '@/api/services/catalog.service'
import { IBrand } from '@/types/brand.type'
import { ITransmission } from '@/types/transmission.type'

interface UseCatalogDataResult {
    brands: { value: string; label: string }[]
    transmissions: { value: string; label: string }[]
    isLoading: boolean
    error: Error | null
}

const useCatalogData = (): UseCatalogDataResult => {
    const [brands, setBrands] = useState<{ value: string; label: string }[]>([])
    const [transmissions, setTransmissions] = useState<{ value: string; label: string }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const catalogData: ICatalogData = await catalogService.getCatalogData()

                const brandOptions = catalogData.brands.map((brand: IBrand) => ({
                    value: brand.id.toString(),
                    label: brand.name,
                }))

                const transmissionOptions = catalogData.transmissions.map((transmission: ITransmission) => ({
                    value: transmission.id.toString(),
                    label: transmission.name,
                }))

                setBrands(brandOptions)
                setTransmissions(transmissionOptions)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch catalog data'))
                console.error('Failed to fetch catalog data:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return { brands, transmissions, isLoading, error }
}

export default useCatalogData
