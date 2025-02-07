import { Profile } from "./user-profile.interface"
import { Wallet } from "./user.interface"



export type Transaction = {
    id: number,
    transaction_id: string,
    wallet: Wallet,
    flow_type: "ACTIVATION" | "WITHDRAW" | "DEPOSIT" | "SENT" | "RECEIVED" | "REFUND" | "COMMISSION",
    currency_type: string,
    amount: string,
    status: "PENDING" | "COMPLETED" | "FAILED",
    direction: string,
    phone_number: string,
    message: string,
    transaction_option: TransactionOption | null,
    create_date: string,
}

export type TransactionOption = {
    name: string,
    slug: string,
    deposit_min: number,
    deposit_max: number,
    withdraw_min: number,
    withdraw_max: number
}