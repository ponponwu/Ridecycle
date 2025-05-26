// frontend/src/api/services/catalog.service.ts
import apiClient, { JSONAPIResponse, extractData, extractPaginationMeta, PaginationMeta } from '../client'
import { IBrand } from '@/types/brand.type'
import { ITransmission } from '@/types/transmission.type'

// ApiCatalogResponse 不再需要，因為我們期望的是 JSONAPIResponse<CatalogDataAttributes>

// 定義最終返回給使用者的數據結構
export interface ICatalogData {
    brands: IBrand[]
    transmissions: ITransmission[]
}

export interface IBrandResponse {
    brands: IBrand[]
    pagination: PaginationMeta | null
}

export interface ITransmissionResponse {
    transmissions: ITransmission[]
    pagination: PaginationMeta | null
}

// 定義 attributes 內部結構 (不含 id)
interface BrandAttributes {
    name: string
    createdAt: string
    updatedAt: string
    // ... 其他 IBrand 應有的屬性 (除了 id)
}

interface TransmissionAttributes {
    name: string
    // ... 其他 ITransmission 應有的屬性 (除了 id)
}

// Helper type for the /catalog endpoint's JSON:API data attribute
// Now reflects that brands/transmissions are objects containing a data array.
interface CatalogDataAttributes {
    brands: { data: Array<{ id: string; attributes: BrandAttributes }> }
    transmissions: { data: Array<{ id: string; attributes: TransmissionAttributes }> }
}

const catalogService = {
    /**
     * Get all catalog data (brands and transmissions)
     */
    getCatalogData: async (): Promise<ICatalogData> => {
        try {
            const response: JSONAPIResponse<CatalogDataAttributes> = await apiClient.get('catalog')
            console.log('API Response for /catalog:', response)

            const catalogSpecificAttributes = extractData(response)

            if (
                catalogSpecificAttributes &&
                typeof catalogSpecificAttributes === 'object' &&
                !Array.isArray(catalogSpecificAttributes)
            ) {
                // 存取 .data 屬性來獲取實際的陣列
                const rawBrands = (catalogSpecificAttributes.brands && catalogSpecificAttributes.brands.data) || []
                const rawTransmissions =
                    (catalogSpecificAttributes.transmissions && catalogSpecificAttributes.transmissions.data) || []

                // 將 rawBrands (Array<{id: string, attributes: BrandAttributes}>) 轉換為 IBrand[] (扁平結構)
                // 假設 IBrand 類型已定義為扁平結構 {id: string, name: string, ...}
                const finalBrands: IBrand[] = rawBrands.map((brandResource) => ({
                    id: brandResource.id,
                    name: brandResource.attributes.name,
                    createdAt: new Date(brandResource.attributes.createdAt),
                    updatedAt: new Date(brandResource.attributes.updatedAt),
                }))

                // 將 rawTransmissions 轉換為 ITransmission[]
                const finalTransmissions: ITransmission[] = rawTransmissions.map((transmissionResource) => ({
                    id: transmissionResource.id,
                    name: transmissionResource.attributes.name,
                }))

                return {
                    brands: finalBrands,
                    transmissions: finalTransmissions,
                }
            }
            // Fallback if attributes is not in the expected object form or missing properties
            console.warn(
                'Catalog data attributes are not in the expected format or missing:',
                catalogSpecificAttributes
            )
            return { brands: [], transmissions: [] } // 返回空數據結構以避免後續錯誤
        } catch (error) {
            console.error('Failed to fetch catalog data:', error)
            throw error
        }
    },

    /**
     * Get brands (可能帶分頁，假設直接返回 IBrandResponse 結構)
     */
    getBrands: async (): Promise<IBrandResponse> => {
        try {
            const response: JSONAPIResponse<IBrand> = await apiClient.get('brands')
            const data = extractData(response)
            return {
                brands: Array.isArray(data) ? data : data ? [data] : [],
                pagination: extractPaginationMeta(response),
            }
        } catch (error) {
            console.error('Failed to fetch brands:', error)
            throw error
        }
    },

    /**
     * Get transmissions (可能帶分頁，假設直接返回 ITransmissionResponse 結構)
     */
    getTransmissions: async (): Promise<ITransmissionResponse> => {
        try {
            const response: JSONAPIResponse<ITransmission> = await apiClient.get('transmissions')
            const data = extractData(response)
            return {
                transmissions: Array.isArray(data) ? data : data ? [data] : [],
                pagination: extractPaginationMeta(response),
            }
        } catch (error) {
            console.error('Failed to fetch transmissions:', error)
            throw error
        }
    },

    /**
     * Get a single brand by ID
     */
    getBrandById: async (id: string | number): Promise<IBrand | null> => {
        try {
            const response: JSONAPIResponse<IBrand> = await apiClient.get(`brands/${id}`)
            const data = extractData(response)
            return Array.isArray(data) || !data ? null : data
        } catch (error) {
            console.error(`Failed to fetch brand with id ${id}:`, error)
            throw error
        }
    },

    /**
     * Get a single transmission by ID
     */
    getTransmissionById: async (id: string | number): Promise<ITransmission | null> => {
        try {
            const response: JSONAPIResponse<ITransmission> = await apiClient.get(`transmissions/${id}`)
            const data = extractData(response)
            return Array.isArray(data) || !data ? null : data
        } catch (error) {
            console.error(`Failed to fetch transmission with id ${id}:`, error)
            throw error
        }
    },
}

export default catalogService
