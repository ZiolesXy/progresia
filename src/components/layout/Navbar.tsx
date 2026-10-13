import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, Menu, X } from "lucide-react";
import { currentUser } from "../../data/dummy";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Kelompok", href: "/groups", icon: Users },
];

export function Navbar() {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                            <span className="text-sm font-bold text-white">P</span>
                        </div>
                        <span className="hidden font-semibold text-slate-900 sm:block">
                            Progresia
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-1 md:flex">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                            ? "bg-primary-50 text-primary-700"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-2.5 sm:flex">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                                <span className="text-sm font-medium text-primary-700">
                                    {currentUser.fullName.charAt(0)}
                                </span>
                            </div>
                            <div className="text-sm">
                                <p className="font-medium leading-tight text-slate-900">
                                    {currentUser.fullName}
                                </p>
                                <p className="text-xs leading-tight text-slate-500">
                                    {currentUser.studentId}
                                </p>
                            </div>
                        </div>

                        <button
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            title="Keluar"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>

                        <button
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <nav className="space-y-1 border-t border-slate-100 py-3 md:hidden">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isActive
                                            ? "bg-primary-50 text-primary-700"
                                            : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            );
                        })}

                        <div className="mt-2 border-t border-slate-100 pt-2 sm:hidden">
                            <p className="px-3 text-sm font-medium text-slate-900">
                                {currentUser.fullName}
                            </p>
                            <p className="px-3 text-xs text-slate-500">
                                {currentUser.studentId}
                            </p>
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}