import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, StickyNote, Store } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/home/Footer';
import PageContainer from '../../components/ui/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import WarrantyStatusBadge from '../../components/ui/WarrantyStatusBadge';
import { warrantyService } from '../../services/warrantyService';
import { getProductThumbnail } from '../../utils/productThumbnail';
import { getRemainingWarrantyLabel } from '../../utils/remainingWarrantyTime';
import type { WarrantyResult, WarrantyStatus } from '../../types/warranty';

function formatApiDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const statusAccentClasses: Record<WarrantyStatus, string> = {
  ACTIVE: 'border-l-4 border-l-emerald-500',
  EXPIRING_SOON: 'border-l-4 border-l-amber-500',
  EXPIRED: 'border-l-4 border-l-red-500',
};

export default function WarrantyResultsPage() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<WarrantyResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mobile = useMemo(() => searchParams.get('mobile') ?? '', [searchParams]);

  useEffect(() => {
    const loadResults = async () => {
      if (!mobile) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        setIsLoading(true);
        const response = await warrantyService.searchWarrantyByMobile(mobile);
        setResults(response);
      } catch {
        setError('Unable to load warranties right now. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadResults();
  }, [mobile]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <PageContainer className="pt-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Search Results</h1>
              <p className="mt-2 text-slate-600">Mobile Number: <span className="font-semibold text-slate-900">{mobile || 'N/A'}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/search">
                <Button variant="secondary">Back to Search</Button>
              </Link>
              <div className="text-sm font-semibold text-blue-800">{results.length} Warranties Found</div>
            </div>
          </div>

          {isLoading ? <Card>Loading warranties...</Card> : null}
          {error ? <Card className="text-red-700">{error}</Card> : null}

          {!isLoading && !error && results.length === 0 ? (
            <Card className="text-center">
              <img src="/images/empty-warranty.svg" alt="Empty warranty results" className="mx-auto w-full max-w-[320px]" />
              <h2 className="mt-4 text-xl font-semibold text-slate-900">No warranties found</h2>
              <p className="mt-2 text-slate-600">We could not find any registrations for this mobile number.</p>
              <div className="mt-5">
                <Link to="/register">
                  <Button>Register a Warranty</Button>
                </Link>
              </div>
            </Card>
          ) : null}

          {!isLoading && !error && results.length > 0 ? (
            <div className="space-y-4">
              {results.map((item) => (
                <Card key={item.id} className={`p-5 ${statusAccentClasses[item.status]}`}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <img src={getProductThumbnail(item.category)} alt="Product thumbnail" className="h-16 w-16 shrink-0 rounded-xl bg-slate-50 object-contain p-2" />
                      <div>
                        <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                          {item.category}
                        </span>
                        <h3 className="mt-1.5 text-lg font-bold leading-tight text-blue-950">{item.productName}</h3>
                        <p className="mt-0.5 text-sm text-slate-500">
                          Model: {item.modelNumber} &middot; Registered by {item.ownerName}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row items-center gap-2 lg:flex-col lg:items-end lg:gap-1">
                      <WarrantyStatusBadge status={item.status} />
                      <span className={`text-xs font-medium ${item.status === 'EXPIRED' ? 'text-red-600' : 'text-slate-500'}`}>
                        {getRemainingWarrantyLabel(item.warrantyEndDate, item.status === 'EXPIRED')}
                      </span>
                    </div>
                  </div>

                  <div className="my-4 h-px bg-slate-100" />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Store size={13} /> Purchase Details
                      </div>
                      <dl className="mt-2 space-y-1.5 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-slate-500">Purchase Date</dt>
                          <dd className="font-semibold text-slate-900">{formatApiDate(item.purchaseDate)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-slate-500">Purchase Source</dt>
                          <dd className="font-semibold text-slate-900">{item.purchaseSource}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <ShieldCheck size={13} /> Warranty Period
                      </div>
                      <dl className="mt-2 space-y-1.5 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-slate-500">Start</dt>
                          <dd className="font-semibold text-slate-900">{formatApiDate(item.warrantyStartDate)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-slate-500">End</dt>
                          <dd className="font-semibold text-slate-900">{formatApiDate(item.warrantyEndDate)}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {item.notes ? (
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                      <StickyNote size={14} className="mt-0.5 shrink-0" />
                      <p>{item.notes}</p>
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </PageContainer>
      <Footer />
    </div>
  );
}
