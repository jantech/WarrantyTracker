export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-4 border-t border-slate-200 bg-white/80 py-4 text-slate-600">
      <div className="mx-auto max-w-7xl px-6 text-center text-sm">
        © {year} Warranty Tracker. Customer self-service portal.
      </div>
    </footer>
  );
}