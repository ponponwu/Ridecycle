import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom' // Import useNavigate
import { Button } from '@/components/ui/button'
import { Search, User, MessageCircle, Bookmark, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate() // Initialize useNavigate

    const handleSignOut = async () => {
        try {
            await logout()
            navigate('/') // Redirect to homepage after logout
        } catch (error) {
            console.error('Logout failed:', error)
            // Optionally show a toast notification for logout failure
        }
    }

    return (
        <header className="sticky top-0 z-30 w-full bg-white border-b shadow-sm">
            <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6 lg:px-8">
                {/* Logo */}
                <Link to="/" className="flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-marketplace-blue mr-2"
                    >
                        <circle cx="5.5" cy="17.5" r="3.5" />
                        <circle cx="18.5" cy="17.5" r="3.5" />
                        <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
                    </svg>
                    <span className="text-xl font-bold text-gray-900">Pedal Palace</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center space-x-1">
                    <Link
                        to="/search"
                        className="px-3 py-2 text-gray-700 hover:text-marketplace-blue transition-colors"
                    >
                        瀏覽
                    </Link>
                    <Link
                        to="/favorites"
                        className="px-3 py-2 text-gray-700 hover:text-marketplace-blue transition-colors"
                    >
                        收藏
                    </Link>
                    <Link
                        to="/messages"
                        className="px-3 py-2 text-gray-700 hover:text-marketplace-blue transition-colors"
                    >
                        消息
                    </Link>
                </nav>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center space-x-3">
                    <Link to="/search">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <Search className="h-5 w-5" />
                        </Button>
                    </Link>

                    {currentUser ? (
                        <>
                            <Link to="/profile">
                                <Button variant="ghost" className="text-gray-700 hover:text-marketplace-blue">
                                    <User className="h-5 w-5 mr-2" />
                                    個人中心
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                className="text-gray-700 hover:text-marketplace-blue"
                                onClick={handleSignOut}
                            >
                                <LogOut className="h-5 w-5 mr-2" />
                                登出
                            </Button>
                        </>
                    ) : (
                        <Link to="/login">
                            <Button variant="ghost" className="text-gray-700 hover:text-marketplace-blue">
                                登入
                            </Button>
                        </Link>
                    )}

                    <Link to="/upload">
                        <Button className="bg-marketplace-blue hover:bg-blue-600 text-white">出售自行車</Button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-16 bg-white z-20 animate-fade-in">
                    <div className="container px-4 py-6 mx-auto">
                        <nav className="flex flex-col space-y-4">
                            <Link
                                to="/search"
                                className="flex items-center p-3 rounded-lg hover:bg-gray-100"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Search className="w-5 h-5 mr-3 text-gray-500" />
                                <span className="text-gray-700">瀏覽自行車</span>
                            </Link>

                            <Link
                                to="/favorites"
                                className="flex items-center p-3 rounded-lg hover:bg-gray-100"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Bookmark className="w-5 h-5 mr-3 text-gray-500" />
                                <span className="text-gray-700">我的收藏</span>
                            </Link>

                            <Link
                                to="/messages"
                                className="flex items-center p-3 rounded-lg hover:bg-gray-100"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <MessageCircle className="w-5 h-5 mr-3 text-gray-500" />
                                <span className="text-gray-700">消息中心</span>
                            </Link>

                            {currentUser ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="flex items-center p-3 rounded-lg hover:bg-gray-100"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <User className="w-5 h-5 mr-3 text-gray-500" />
                                        <span className="text-gray-700">個人中心</span>
                                    </Link>

                                    <button
                                        className="flex items-center p-3 rounded-lg hover:bg-gray-100 w-full text-left"
                                        onClick={() => {
                                            handleSignOut()
                                            setIsMenuOpen(false)
                                        }}
                                    >
                                        <LogOut className="w-5 h-5 mr-3 text-gray-500" />
                                        <span className="text-gray-700">登出</span>
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="flex items-center p-3 rounded-lg hover:bg-gray-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <User className="w-5 h-5 mr-3 text-gray-500" />
                                    <span className="text-gray-700">登入</span>
                                </Link>
                            )}

                            <div className="pt-6">
                                {!currentUser && (
                                    <Link to="/login">
                                        <Button
                                            variant="outline"
                                            className="w-full mb-3"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            登入
                                        </Button>
                                    </Link>
                                )}
                                <Link to="/upload">
                                    <Button
                                        className="w-full bg-marketplace-blue hover:bg-blue-600"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        出售自行車
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
