import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { getProductThumbnail } from '../../utils/productThumbnail';

interface ProductOption {
  id: number;
  name: string;
  category: string;
  modelNumber?: string | null;
}

interface ProductSelectProps {
  label: string;
  id: string;
  products: ProductOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
}

export default function ProductSelect({
  label,
  id,
  products,
  value,
  onChange,
  onBlur,
  placeholder = 'Select an option',
  error,
}: ProductSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onBlur?.();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onBlur]);

  const selectedProduct = products.find((product) => product.id.toString() === value);

  const groupedProducts = products.reduce<Record<string, ProductOption[]>>((groups, product) => {
    groups[product.category] = groups[product.category] ?? [];
    groups[product.category].push(product);
    return groups;
  }, {});

  return (
    <div ref={containerRef}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <div
          role="button"
          tabIndex={0}
          id={id}
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setIsOpen((open) => !open);
            }
          }}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-white px-3 py-2 text-left text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200 ${error ? 'border-red-500' : 'border-slate-300'}`}
        >
          {selectedProduct ? (
            <span className="flex min-w-0 items-center gap-2">
              <img
                src={getProductThumbnail(selectedProduct.category)}
                alt=""
                className="h-8 w-8 shrink-0 rounded-md bg-slate-50 object-contain p-1"
              />
              <span className="truncate">{selectedProduct.name}</span>
            </span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
          <span className="flex shrink-0 items-center gap-1">
            {selectedProduct ? (
              <button
                type="button"
                aria-label="Clear selected product"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange('');
                  onBlur?.();
                }}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            ) : null}
            <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </div>

        {isOpen ? (
          <div
            role="listbox"
            className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
          >
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <div key={category} className="mb-1 last:mb-0">
                <div className="px-2 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">{category}</div>
                {categoryProducts.map((product) => {
                  const isSelected = value === product.id.toString();

                  return (
                    <button
                      type="button"
                      key={product.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(product.id.toString());
                        setIsOpen(false);
                        onBlur?.();
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-blue-50 ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      <img
                        src={getProductThumbnail(category)}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded-md bg-slate-50 object-contain p-1"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900">{product.name}</span>
                        {product.modelNumber ? (
                          <span className="block truncate text-xs text-slate-500">{product.modelNumber}</span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
    </div>
  );
}
