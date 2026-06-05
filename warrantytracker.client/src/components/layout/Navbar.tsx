import { Menu, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="text-blue-700" />
          <span className="text-lg font-bold tracking-tight">Warranty Tracker</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link className="transition hover:text-blue-700" to="/">Home</Link>
          <Link className="transition hover:text-blue-700" to="/register">Register Warranty</Link>
          <Link className="transition hover:text-blue-700" to="/search">Search Warranty</Link>
        </nav>

        <div className="md:hidden">
          <Link to="/search" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">
            <Menu size={16} />
            Menu
          </Link>
        </div>
      </div>
    </header>
  );
}