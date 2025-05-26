export interface IBrand {
    id: string | number
    name: string
    logoUrl?: string
    createdAt: Date
    updatedAt: Date
}

export interface IBrandResponse {
    data: IBrand[]
}
