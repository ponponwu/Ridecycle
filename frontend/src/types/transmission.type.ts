export interface ITransmission {
    id: string | number
    name: string
}

export interface ITransmissionResponse {
    data: ITransmission[] // 注意這裡的鍵名變為 transmissions
}
