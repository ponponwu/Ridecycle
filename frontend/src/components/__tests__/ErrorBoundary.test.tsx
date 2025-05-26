import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ErrorBoundary from '../ErrorBoundary'

// Mock console.error to avoid noise in test output
const originalError = console.error
beforeAll(() => {
    console.error = vi.fn()
})

afterAll(() => {
    console.error = originalError
})

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error')
    }
    return <div>No error</div>
}

describe('ErrorBoundary', () => {
    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        )

        expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('renders error UI when there is an error', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(screen.getByText('糟糕！出現了一些問題')).toBeInTheDocument()
        expect(screen.getByText('重試')).toBeInTheDocument()
        expect(screen.getByText('重新載入頁面')).toBeInTheDocument()
    })

    it('renders custom fallback when provided', () => {
        const customFallback = <div>Custom error message</div>

        render(
            <ErrorBoundary fallback={customFallback}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })
})
