import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Search, User, MessageCircle, Bookmark, Menu, X, LogOut, Shield, ShoppingBag, Bike } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const Navbar = () => {
    const { t } = useTranslation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        try {
            await logout()
            navigate('/')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="container flex items-center justify-between h-20 px-4 mx-auto sm:px-6 lg:px-8">
                {/* Logo */}
                <Link to="/" className="flex items-center group">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mr-3 group-hover:scale-105 transition-transform duration-200">
                        <Bike className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900 leading-tight">{t('ride')}</span>
                        <span className="text-xs text-emerald-600 font-medium leading-tight">Bike Exchange</span>
                    </div>
                </Link>


                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center space-x-3">
                    <Link to="/search">
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-emerald-600">
                            <Search className="w-5 h-5" />
                        </Button>
                    </Link>

                    {currentUser ? (
                        <>
                            {!currentUser.admin && (
                                <Link to="/profile">
                                    <Button
                                        variant="ghost"
                                        className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                                    >
                                        <User className="h-5 w-5 mr-2" />
                                        {t('personalCenter')}
                                    </Button>
                                </Link>
                            )}
                            {currentUser.admin && (
                                <Link to="/admin">
                                    <Button
                                        variant="ghost"
                                        className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                                    >
                                        <Shield className="h-5 w-5 mr-2" />
                                        {t('adminArea')}
                                    </Button>
                                </Link>
                            )}
                            <Button
                                variant="ghost"
                                className="text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                onClick={handleSignOut}
                            >
                                <LogOut className="h-5 w-5 mr-2" />
                                {t('logout')}
                            </Button>
                        </>
                    ) : (
                        <Link to="/login">
                            <Button
                                variant="ghost"
                                className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                            >
                                {t('login')}
                            </Button>
                        </Link>
                    )}

                    <Link to="/upload">
                        <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                            {t('sellBicycle')}
                        </Button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-20 bg-white/95 backdrop-blur-md z-30 animate-fade-in">
                    <div className="container px-4 py-6 mx-auto">
                        <nav className="flex flex-col space-y-2">
                            <Link
                                to="/search"
                                className="flex items-center p-4 rounded-xl hover:bg-emerald-50 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Search className="w-5 h-5 mr-3 text-emerald-600" />
                                <span className="text-gray-700 font-medium">{t('browseBicycles')}</span>
                            </Link>

                            <Link
                                to="/favorites"
                                className="flex items-center p-4 rounded-xl hover:bg-emerald-50 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Bookmark className="w-5 h-5 mr-3 text-emerald-600" />
                                <span className="text-gray-700 font-medium">{t('favorites')}</span>
                            </Link>

                            <Link
                                to="/messages"
                                className="flex items-center p-4 rounded-xl hover:bg-emerald-50 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <MessageCircle className="w-5 h-5 mr-3 text-emerald-600" />
                                <span className="text-gray-700 font-medium">{t('messages')}</span>
                            </Link>

                            {currentUser && (
                                <Link
                                    to="/orders"
                                    className="flex items-center p-4 rounded-xl hover:bg-emerald-50 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <ShoppingBag className="w-5 h-5 mr-3 text-emerald-600" />
                                    <span className="text-gray-700 font-medium">{t('myOrders')}</span>
                                </Link>
                            )}

                            {currentUser ? (
                                <>
                                    {!currentUser.admin && (
                                        <Link
                                            to="/profile"
                                            className="flex items-center p-4 rounded-xl hover:bg-emerald-50 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <User className="w-5 h-5 mr-3 text-emerald-600" />
                                            <span className="text-gray-700 font-medium">{t('personalCenter')}</span>
                                        </Link>
                                    )}

                                    {currentUser.admin && (
                                        <Link
                                            to="/admin"
                                            className="flex items-center p-4 rounded-xl hover:bg-emerald-50 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Shield className="w-5 h-5 mr-3 text-emerald-600" />
                                            <span className="text-gray-700 font-medium">{t('adminArea')}</span>
                                        </Link>
                                    )}

                                    <button
                                        className="flex items-center p-4 rounded-xl hover:bg-red-50 w-full text-left transition-colors"
                                        onClick={() => {
                                            handleSignOut()
                                            setIsMenuOpen(false)
                                        }}
                                    >
                                        <LogOut className="w-5 h-5 mr-3 text-red-600" />
                                        <span className="text-gray-700 font-medium">{t('logout')}</span>
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="flex items-center p-4 rounded-xl hover:bg-emerald-50 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <User className="w-5 h-5 mr-3 text-emerald-600" />
                                    <span className="text-gray-700 font-medium">{t('login')}</span>
                                </Link>
                            )}

                            <div className="pt-4">
                                <Link to="/upload" className="block" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl shadow-lg">
                                        {t('sellBicycle')}
                                    </Button>
                                </Link>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar
