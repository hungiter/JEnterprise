export interface CardInfo {
    id: number
    cardType: string
    issuer: string
    cardNumber: string
    cardHolder: string
    issueDate: string
    expiryDate: string
    city: string
    email: string
    address: string
    cvv: string
    otp: string
}

export interface CreatePaymentUrlResponse {
    success: boolean
    url: string
    message: string
}

export interface VnPayTransaction {
    username: string
    tourCode: string
    orderDescription: string
    paymentUrl: string
    createAt: string
    expireAt: string
    status: string
}