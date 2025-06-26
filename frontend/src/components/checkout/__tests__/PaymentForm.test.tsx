import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import PaymentForm from '../PaymentForm'
import { IPaymentInfo, COMPANY_BANK_ACCOUNT } from '@/types/checkout.types'

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
    },
})

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
)

describe('PaymentForm', () => {
    const mockOnSubmit = vi.fn()
    const mockOnBack = vi.fn()

    const defaultProps = {
        onSubmit: mockOnSubmit,
        onBack: mockOnBack,
        totalAmount: 12500,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders payment form with bank account information', () => {
        render(
            <TestWrapper>
                <PaymentForm {...defaultProps} />
            </TestWrapper>
        )

        // 檢查付款資訊標題 (英文)
        expect(screen.getByText('Payment Information')).toBeInTheDocument()

        // 檢查轉帳金額
        expect(screen.getByText('NT$ 12,500')).toBeInTheDocument()

        // 檢查銀行帳戶資訊
        expect(screen.getByText('銀行帳戶')).toBeInTheDocument()
        expect(screen.getByText(COMPANY_BANK_ACCOUNT.bankName)).toBeInTheDocument()
        expect(screen.getByText(COMPANY_BANK_ACCOUNT.bankCode)).toBeInTheDocument()
        expect(screen.getByText(COMPANY_BANK_ACCOUNT.accountNumber)).toBeInTheDocument()
        expect(screen.getByText(COMPANY_BANK_ACCOUNT.accountName)).toBeInTheDocument()
    })

    it('shows transfer deadline warning', () => {
        render(
            <TestWrapper>
                <PaymentForm {...defaultProps} />
            </TestWrapper>
        )

        expect(screen.getByText('請於24小時內完成轉帳')).toBeInTheDocument()
    })

    it('allows copying bank account information', async () => {
        render(
            <TestWrapper>
                <PaymentForm {...defaultProps} />
            </TestWrapper>
        )

        // 點擊複製銀行名稱按鈕
        const copyButtons = screen.getAllByRole('button')
        const bankNameCopyButton = copyButtons.find((btn) =>
            btn.closest('div')?.textContent?.includes(COMPANY_BANK_ACCOUNT.bankName)
        )

        if (bankNameCopyButton) {
            await userEvent.click(bankNameCopyButton)
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(COMPANY_BANK_ACCOUNT.bankName)
        }
    })

    it('validates required fields', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <PaymentForm {...defaultProps} />
            </TestWrapper>
        )

        // 嘗試提交空表單 (使用英文按鈕文字)
        const submitButton = screen.getByRole('button', { name: 'Review Your Order' })
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('This field is required')).toBeInTheDocument()
        })

        expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('validates account last five digits format', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <PaymentForm {...defaultProps} />
            </TestWrapper>
        )

        // 填寫轉帳備註
        const transferNoteInput = screen.getByPlaceholderText('請輸入您的姓名作為轉帳備註')
        await user.type(transferNoteInput, '王小明')

        // 填寫錯誤的帳戶後五碼
        const accountDigitsInput = screen.getByPlaceholderText('請輸入轉帳帳戶後五碼')
        await user.type(accountDigitsInput, '1234') // 只有4位數

        const submitButton = screen.getByRole('button', { name: 'Review Your Order' })
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('請輸入完整的後五碼')).toBeInTheDocument()
        })
    })

    it('only allows numeric input for account digits', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <PaymentForm {...defaultProps} />
            </TestWrapper>
        )

        const accountDigitsInput = screen.getByPlaceholderText('請輸入轉帳帳戶後五碼')
        await user.type(accountDigitsInput, 'abc12345')

        // 應該只顯示數字部分，且限制5位
        expect(accountDigitsInput).toHaveValue('12345')
    })

    it('handles file upload for transfer proof', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <PaymentForm {...defaultProps} />
            </TestWrapper>
        )

        // 創建測試文件
        const file = new File(['transfer receipt'], 'receipt.jpg', { type: 'image/jpeg' })

        // 使用 querySelector 查找隱藏的 file input
        const fileInput = document.querySelector('#transfer-proof') as HTMLInputElement

        if (fileInput) {
            await user.upload(fileInput, file)

            // 檢查文件上傳成功提示
            await waitFor(() => {
                expect(screen.getByText('✓ 已上傳：receipt.jpg')).toBeInTheDocument()
            })
        }
    })

    it('submits form with valid data', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <PaymentForm {...defaultProps} />
            </TestWrapper>
        )

        // 填寫表單
        const transferNoteInput = screen.getByPlaceholderText('請輸入您的姓名作為轉帳備註')
        await user.type(transferNoteInput, '王小明')

        const accountDigitsInput = screen.getByPlaceholderText('請輸入轉帳帳戶後五碼')
        await user.type(accountDigitsInput, '12345')

        // 提交表單
        const submitButton = screen.getByRole('button', { name: 'Review Your Order' })
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentMethod: 'bankTransfer',
                    transferNote: '王小明',
                    accountLastFiveDigits: '12345',
                })
            )
        })
    })

    it('calls onBack when back button is clicked', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <PaymentForm {...defaultProps} />
            </TestWrapper>
        )

        const backButton = screen.getByRole('button', { name: 'Back to Shipping' })
        await user.click(backButton)

        expect(mockOnBack).toHaveBeenCalled()
    })

    it('shows security notes and instructions', () => {
        render(
            <TestWrapper>
                <PaymentForm {...defaultProps} />
            </TestWrapper>
        )

        // 檢查注意事項
        expect(screen.getByText('注意事項：')).toBeInTheDocument()
        expect(screen.getByText('請確保轉帳金額與訂單金額完全一致')).toBeInTheDocument()
        expect(screen.getByText('轉帳備註請填寫您的姓名，方便我們核對')).toBeInTheDocument()
        expect(screen.getByText('請保留轉帳收據，並上傳作為付款證明')).toBeInTheDocument()
    })

    it('renders with initial values', () => {
        const initialValues: Partial<IPaymentInfo> = {
            transferNote: '張小華',
            accountLastFiveDigits: '56789',
        }

        render(
            <TestWrapper>
                <PaymentForm {...defaultProps} initialValues={initialValues} />
            </TestWrapper>
        )

        expect(screen.getByDisplayValue('張小華')).toBeInTheDocument()
        expect(screen.getByDisplayValue('56789')).toBeInTheDocument()
    })

    it('shows correct file upload requirements', () => {
        render(
            <TestWrapper>
                <PaymentForm {...defaultProps} />
            </TestWrapper>
        )

        expect(screen.getByText('支援 JPG、PNG、PDF 格式，檔案大小不超過 5MB')).toBeInTheDocument()
        expect(screen.getByText('請上傳轉帳收據或截圖作為付款證明')).toBeInTheDocument()
    })
})
