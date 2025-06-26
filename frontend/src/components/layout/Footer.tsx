import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bike } from 'lucide-react'

const Footer = () => {
    const { t } = useTranslation()

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white border-t border-emerald-800">
            <div className="container px-6 py-12 mx-auto">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                                <Bike className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                                    {t('footer.brandName')}
                                </span>
                                <div className="text-xs text-emerald-300">二手自行車交易平台</div>
                            </div>
                        </div>
                        <p className="max-w-xs text-sm text-gray-300 leading-relaxed mb-6">
                            {t('footer.brandTagline')}
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="p-2 text-gray-400 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-emerald-500/20 hover:text-emerald-300 transition-all duration-300 hover:scale-110"
                            >
                                <span className="sr-only">Facebook</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path
                                        fillRule="evenodd"
                                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="p-2 text-gray-400 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-emerald-500/20 hover:text-emerald-300 transition-all duration-300 hover:scale-110"
                            >
                                <span className="sr-only">Instagram</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path
                                        fillRule="evenodd"
                                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="p-2 text-gray-400 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-emerald-500/20 hover:text-emerald-300 transition-all duration-300 hover:scale-110"
                            >
                                <span className="sr-only">Twitter</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div>
                        <h3 className="mb-4 text-sm font-bold tracking-wider text-emerald-300 uppercase border-b border-emerald-700 pb-2">
                            {t('footer.navigation.title')}
                        </h3>
                        <div className="space-y-3">
                            <Link
                                to="/"
                                className="block text-sm text-gray-300 hover:text-emerald-300 transition-colors duration-300 hover:pl-2"
                            >
                                {t('footer.navigation.home')}
                            </Link>
                            <Link
                                to="/search"
                                className="block text-sm text-gray-300 hover:text-emerald-300 transition-colors duration-300 hover:pl-2"
                            >
                                {t('footer.navigation.browseBikes')}
                            </Link>
                            <Link
                                to="/upload"
                                className="block text-sm text-gray-300 hover:text-emerald-300 transition-colors duration-300 hover:pl-2"
                            >
                                {t('footer.navigation.sellYourBike')}
                            </Link>
                        </div>
                    </div>

                    {/* Account Section */}
                    <div>
                        <h3 className="mb-4 text-sm font-bold tracking-wider text-emerald-300 uppercase border-b border-emerald-700 pb-2">
                            {t('footer.account.title')}
                        </h3>
                        <div className="space-y-3">
                            <Link
                                to="/login"
                                className="block text-sm text-gray-300 hover:text-emerald-300 transition-colors duration-300 hover:pl-2"
                            >
                                {t('footer.account.signIn')}
                            </Link>
                            <Link
                                to="/register"
                                className="block text-sm text-gray-300 hover:text-emerald-300 transition-colors duration-300 hover:pl-2"
                            >
                                {t('footer.account.createAccount')}
                            </Link>
                            <Link
                                to="/profile"
                                className="block text-sm text-gray-300 hover:text-emerald-300 transition-colors duration-300 hover:pl-2"
                            >
                                {t('footer.account.myProfile')}
                            </Link>
                            <Link
                                to="/dashboard"
                                className="block text-sm text-gray-300 hover:text-emerald-300 transition-colors duration-300 hover:pl-2"
                            >
                                {t('footer.account.dashboard')}
                            </Link>
                        </div>
                    </div>

                    {/* Support Section */}
                    <div>
                        <h3 className="mb-4 text-sm font-bold tracking-wider text-emerald-300 uppercase border-b border-emerald-700 pb-2">
                            {t('footer.support.title')}
                        </h3>
                        <div className="space-y-3">
                            <a
                                href="#"
                                className="block text-sm text-gray-300 hover:text-emerald-300 transition-colors duration-300 hover:pl-2"
                            >
                                {t('footer.support.helpCenter')}
                            </a>
                            <a
                                href="#"
                                className="block text-sm text-gray-300 hover:text-emerald-300 transition-colors duration-300 hover:pl-2"
                            >
                                {t('footer.support.safetyTips')}
                            </a>
                            <a
                                href="#"
                                className="block text-sm text-gray-300 hover:text-emerald-300 transition-colors duration-300 hover:pl-2"
                            >
                                {t('footer.support.contactUs')}
                            </a>
                            <a
                                href="#"
                                className="block text-sm text-gray-300 hover:text-emerald-300 transition-colors duration-300 hover:pl-2"
                            >
                                {t('footer.support.privacyPolicy')}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="pt-8 mt-12 border-t border-emerald-800/50">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-center md:text-left text-gray-400">
                            &copy; {new Date().getFullYear()} {t('footer.brandName')}. {t('footer.copyright')}{' '}
                            {t('footer.allRightsReserved')}.
                        </p>

                        {/* Additional decorative elements */}
                        <div className="flex items-center space-x-2 text-emerald-300">
                            <Bike className="w-4 h-4" />
                            <span className="text-xs font-medium">Made with 💚 for cyclists</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-500/10 rounded-full blur-xl"></div>
            </div>
        </footer>
    )
}

export default Footer
