import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Info, CheckCircle } from 'lucide-react'

interface LegalSectionProps {
    title?: string
    children: React.ReactNode
    type?: 'default' | 'important' | 'warning' | 'info'
    className?: string
}

interface LegalListProps {
    items: string[]
    type?: 'ordered' | 'unordered'
    className?: string
}

interface LegalHighlightProps {
    children: React.ReactNode
    type?: 'important' | 'warning' | 'info'
}

// 法律條文區塊組件
export const LegalSection: React.FC<LegalSectionProps> = ({
    title,
    children,
    type = 'default',
    className = ''
}) => {
    const getTypeStyles = () => {
        switch (type) {
            case 'important':
                return 'border-l-4 border-red-500 bg-red-50/50'
            case 'warning':
                return 'border-l-4 border-amber-500 bg-amber-50/50'
            case 'info':
                return 'border-l-4 border-blue-500 bg-blue-50/50'
            default:
                return 'border-l-4 border-gray-300 bg-white'
        }
    }

    const getTypeIcon = () => {
        switch (type) {
            case 'important':
                return <AlertTriangle className="w-5 h-5 text-red-500" />
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-500" />
            case 'info':
                return <Info className="w-5 h-5 text-blue-500" />
            default:
                return null
        }
    }

    return (
        <div className={`mb-6 ${getTypeStyles()} ${className}`}>
            <div className="p-6">
                {title && (
                    <div className="flex items-center mb-4">
                        {getTypeIcon()}
                        <h3 className="text-lg font-semibold text-gray-800 ml-2">
                            {title}
                        </h3>
                    </div>
                )}
                <div className="prose prose-gray max-w-none">
                    {children}
                </div>
            </div>
        </div>
    )
}

// 法律條文列表組件
export const LegalList: React.FC<LegalListProps> = ({
    items,
    type = 'unordered',
    className = ''
}) => {
    const ListComponent = type === 'ordered' ? 'ol' : 'ul'
    
    return (
        <ListComponent className={`space-y-2 ${className}`}>
            {items.map((item, index) => (
                <li key={index} className="text-gray-700 leading-relaxed">
                    {item}
                </li>
            ))}
        </ListComponent>
    )
}

// 法律條文強調組件
export const LegalHighlight: React.FC<LegalHighlightProps> = ({
    children,
    type = 'info'
}) => {
    const getHighlightStyles = () => {
        switch (type) {
            case 'important':
                return 'bg-red-100 border-red-300 text-red-800'
            case 'warning':
                return 'bg-amber-100 border-amber-300 text-amber-800'
            case 'info':
                return 'bg-blue-100 border-blue-300 text-blue-800'
            default:
                return 'bg-gray-100 border-gray-300 text-gray-800'
        }
    }

    const getIcon = () => {
        switch (type) {
            case 'important':
                return <AlertTriangle className="w-4 h-4" />
            case 'warning':
                return <AlertTriangle className="w-4 h-4" />
            case 'info':
                return <Info className="w-4 h-4" />
            default:
                return <CheckCircle className="w-4 h-4" />
        }
    }

    return (
        <div className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium ${getHighlightStyles()}`}>
            {getIcon()}
            <span className="ml-2">{children}</span>
        </div>
    )
}

// 法律條文定義組件
interface LegalDefinitionProps {
    term: string
    definition: string
    className?: string
}

export const LegalDefinition: React.FC<LegalDefinitionProps> = ({
    term,
    definition,
    className = ''
}) => {
    return (
        <div className={`mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200 ${className}`}>
            <dt className="text-sm font-semibold text-emerald-800 mb-1">
                {term}
            </dt>
            <dd className="text-sm text-gray-700 leading-relaxed">
                {definition}
            </dd>
        </div>
    )
}

// 法律條文表格組件
interface LegalTableProps {
    headers: string[]
    rows: string[][]
    className?: string
}

export const LegalTable: React.FC<LegalTableProps> = ({
    headers,
    rows,
    className = ''
}) => {
    return (
        <div className={`overflow-x-auto mb-6 ${className}`}>
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// 聯絡資訊組件
interface ContactInfoProps {
    email?: string
    phone?: string
    address?: string
    className?: string
}

export const LegalContactInfo: React.FC<ContactInfoProps> = ({
    email = 'legal@ridecycle.com',
    phone = '+886-2-1234-5678',
    address = '台北市信義區信義路五段7號',
    className = ''
}) => {
    return (
        <Card className={`mt-6 ${className}`}>
            <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">聯絡我們</h4>
                <div className="space-y-3 text-sm text-gray-600">
                    {email && (
                        <div>
                            <span className="font-medium">電子郵件：</span>
                            <a 
                                href={`mailto:${email}`} 
                                className="text-emerald-600 hover:text-emerald-800 underline ml-2"
                            >
                                {email}
                            </a>
                        </div>
                    )}
                    {phone && (
                        <div>
                            <span className="font-medium">電話：</span>
                            <a 
                                href={`tel:${phone}`} 
                                className="text-emerald-600 hover:text-emerald-800 underline ml-2"
                            >
                                {phone}
                            </a>
                        </div>
                    )}
                    {address && (
                        <div>
                            <span className="font-medium">地址：</span>
                            <span className="ml-2">{address}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}