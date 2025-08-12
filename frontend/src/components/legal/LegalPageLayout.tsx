import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Calendar, Search, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import MainLayout from '@/components/layout/MainLayout'

interface LegalSection {
    id: string
    title: string
    content: React.ReactNode
}

interface LegalPageLayoutProps {
    title: string
    lastUpdated: string
    sections: LegalSection[]
    searchEnabled?: boolean
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
    title,
    lastUpdated,
    sections,
    searchEnabled = true
}) => {
    const { t } = useTranslation()
    const [searchTerm, setSearchTerm] = React.useState('')
    const [activeSection, setActiveSection] = React.useState<string | null>(null)

    // 過濾區塊內容
    const filteredSections = searchTerm
        ? sections.filter(section =>
            section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof section.content === 'string' && section.content.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : sections

    // 滾動到指定區塊
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setActiveSection(sectionId)
        }
    }

    // 處理錨點連結
    React.useEffect(() => {
        const hash = window.location.hash.replace('#', '')
        if (hash && sections.some(section => section.id === hash)) {
            setTimeout(() => scrollToSection(hash), 100)
        }
    }, [sections])

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    {/* 導航麵包屑 */}
                    <div className="mb-8">
                        <Link
                            to="/"
                            className="inline-flex items-center text-gray-600 hover:text-emerald-600 transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('common.backToHome')}
                        </Link>
                        <div className="flex items-center text-sm text-gray-500 space-x-2">
                            <Link to="/" className="hover:text-emerald-600">{t('common.home')}</Link>
                            <span>/</span>
                            <span className="text-gray-700">{title}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* 側邊欄目錄 */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8">
                                <Card className="shadow-lg border-emerald-100">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-emerald-600" />
                                            {t('legal.tableOfContents')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {/* 搜尋框 */}
                                        {searchEnabled && (
                                            <div className="relative mb-4">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <Input
                                                    placeholder={t('legal.searchPlaceholder')}
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-9 text-sm"
                                                />
                                            </div>
                                        )}

                                        {/* 目錄列表 */}
                                        <nav className="space-y-1">
                                            {filteredSections.map((section) => (
                                                <Button
                                                    key={section.id}
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`w-full justify-start text-left h-auto py-2 px-3 ${
                                                        activeSection === section.id
                                                            ? 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600'
                                                            : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                                    }`}
                                                    onClick={() => scrollToSection(section.id)}
                                                >
                                                    <span className="text-xs leading-relaxed">{section.title}</span>
                                                </Button>
                                            ))}
                                        </nav>

                                        {/* 最後更新時間 */}
                                        <div className="pt-4 mt-4 border-t border-gray-200">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="w-3 h-3 mr-2" />
                                                <span>{t('legal.lastUpdated')}: {lastUpdated}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* 主要內容區域 */}
                        <div className="lg:col-span-3">
                            <Card className="shadow-lg border-emerald-100">
                                <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-100">
                                    <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                                        <FileText className="w-8 h-8 mr-3 text-emerald-600" />
                                        {title}
                                    </CardTitle>
                                    <div className="flex items-center text-sm text-gray-600 mt-2">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {t('legal.lastUpdated')}: {lastUpdated}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0">
                                    <div className="prose prose-lg max-w-none">
                                        {filteredSections.length > 0 ? (
                                            filteredSections.map((section, index) => (
                                                <div
                                                    key={section.id}
                                                    id={section.id}
                                                    className={`p-6 md:p-8 ${
                                                        index < filteredSections.length - 1 
                                                            ? 'border-b border-gray-200' 
                                                            : ''
                                                    }`}
                                                >
                                                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-emerald-200">
                                                        {section.title}
                                                    </h2>
                                                    <div className="text-gray-700 leading-relaxed space-y-4">
                                                        {section.content}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500">
                                                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                <p>{t('legal.noSearchResults')}</p>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setSearchTerm('')}
                                                    className="mt-4"
                                                >
                                                    {t('legal.clearSearch')}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 回到頂部按鈕 */}
                            <div className="mt-8 text-center">
                                <Button
                                    variant="outline"
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700"
                                >
                                    {t('common.backToTop')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default LegalPageLayout