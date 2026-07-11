'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Menu, X, Search, Sun, Moon, User, ChevronDown, MapPin } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuthStore, useCartStore } from '@/store'
import InstallButton from '@/components/pwa/InstallButton'

const navLinks = [
  { label: 'Destinations', href: '/destinations', submenu: [
    { label: 'Maasai Mara', href: '/destinations/maasai-mara', icon: '🦁' },
    { label: 'Zanzibar', href: '/destinations/zanzibar', icon: '🏝️' },
    { label: 'Kilimanjaro', href: '/destinations/kilimanjaro', icon: '🏔️' },
    { label: 'Serengeti', href: '/destinations/serengeti', icon: '🌅' },
    { label: 'Mombasa', href: '/destinations/mombasa', icon: '🌊' },
    { label: 'View all', href: '/destinations', icon: '→' },
  ]},
  { label: 'Tours & Safaris', href: '/tours' },
  { label: 'Guides', href: '/guides' },
  { label: 'Stays', href: '/stays' },
  { label: 'Transport', href: '/transport' },
  { label: 'Blog', href: '/blog' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuthStore()
  const totalItems = useCartStore((s) => s.totalItems())
  const pathname = usePathname()

  const isHome = pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navClass = isHome && !scrolled
    ? 'bg-transparent text-white'
    : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border-b border-gray-100 dark:border-gray-800'

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-md">
                <Image src="https://res.cloudinary.com/doxwolgpe/image/upload/v1781692732/TembeaAfricaLogo_oxaxip.png" alt="Tembea Africa Logo" width={40} height={40} className="object-contain" />
              </div>
              <div className="leading-tight">
                <span className="font-display font-bold text-lg">TEMBEA</span>
                <div className="text-[9px] text-golden-400 tracking-[0.3em] leading-none">AFRICA</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div key={link.href} className="relative group"
                  onMouseEnter={() => link.submenu && setActiveSubmenu(link.label)}
                  onMouseLeave={() => setActiveSubmenu(null)}>
                  <Link href={link.href}
                    className="px-3 py-2 rounded-lg text-xs font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-1">
                    {link.label}
                    {link.submenu && <ChevronDown className="w-3 h-3 opacity-60" />}
                  </Link>
                  {link.submenu && activeSubmenu === link.label && (
                    <div className="absolute top-full left-0 pt-2 w-56">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2">
                        {link.submenu.map((sub) => (
                          <Link key={sub.href} href={sub.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-safari-50 dark:hover:bg-safari-900/30 hover:text-safari-700 transition-colors">
                            <span>{sub.icon}</span> {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <InstallButton className="hidden sm:inline-flex items-center gap-2 rounded-full bg-safari-700 px-4 py-2 text-sm font-semibold text-white hover:bg-safari-800 transition-colors" />

              <Link href="/checkout" className="relative p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-golden-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm font-medium">
                    <div className="w-8 h-8 bg-safari-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                  <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2">
                      <Link href="/dashboard" className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">My bookings</Link>
                      <Link href="/dashboard/profile" className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">Profile</Link>
                      <Link href="/dashboard/wishlist" className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">Wishlist</Link>
                      {user?.role === 'admin' && (
                        <Link href="/admin/dashboard" className="block px-3 py-2 text-sm text-safari-600 font-medium hover:bg-safari-50 dark:hover:bg-safari-900/30 rounded-lg">Admin panel</Link>
                      )}
                      <hr className="my-1 border-gray-100 dark:border-gray-700" />
                      <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">Sign out</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/auth/login" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] sm:text-xs font-medium rounded-full border border-current opacity-80 hover:opacity-100 transition-opacity">
                    <User className="w-3.5 h-3.5" />
                    Sign in
                  </Link>
                  <Link href="/auth/register" className="px-3.5 py-1.5 text-[11px] sm:text-xs font-medium bg-safari-700 text-white rounded-full hover:bg-safari-800 transition-colors shadow-sm">
                    Register
                  </Link>
                </div>
              )}

              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-black/10 transition-colors">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 lg:hidden" style={{ top: 64 }}>
            <div className="bg-white dark:bg-gray-900 h-full overflow-y-auto px-4 py-6 border-t border-gray-100 dark:border-gray-800">
              {navLinks.map((link) => (
                <div key={link.href}>
                  <Link href={link.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-3 text-base font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800">
                    {link.label}
                  </Link>
                  {link.submenu && (
                    <div className="pl-4 mt-1 mb-2">
                      {link.submenu.map((sub) => (
                        <Link key={sub.href} href={sub.href} onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-300">
                          <span>{sub.icon}</span> {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-6 flex flex-col gap-3">
                <InstallButton className="w-full inline-flex justify-center rounded-full bg-safari-700 px-4 py-2 text-sm font-semibold text-white hover:bg-safari-800 transition-colors" />
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 text-center border border-safari-700 text-safari-700 rounded-full font-medium">
                  Sign in
                </Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 text-center bg-safari-700 text-white rounded-full font-medium">
                  List your property
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
