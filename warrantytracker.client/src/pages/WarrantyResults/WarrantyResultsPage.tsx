import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/home/Footer';
import PageContainer from '../../components/ui/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import WarrantyStatusBadge from '../../components/ui/WarrantyStatusBadge';
import { warrantyService } from '../../services/warrantyService';
import type { WarrantyResult } from '../../types/warranty';

function formatApiDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getThumbnail(item: WarrantyResult): string {
  const text = `${item.deviceName} ${item.brandName}`.toLowerCase();

  if (text.includes('phone') || text.includes('iphone') || text.includes('samsung') || text.includes('mobile')) {
    return '/images/device-phone.svg';
  }

  if (text.includes('washing') || text.includes('washer')) {
    return '/images/device-washer.svg';
  }

  return '/images/device-laptop.svg';
}

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
                <Card key={item.id} className="p-4">
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr_0.65fr] lg:items-center">
                    <div className="flex items-center gap-4">
                      <img src={getThumbnail(item)} alt="Device thumbnail" className="h-20 w-20 rounded-xl bg-slate-50 object-contain p-2" />
                      <div>
                        <h3 className="text-lg font-bold text-blue-950">{item.brandName} {item.deviceName}</h3>
                        <p className="mt-1 text-sm text-slate-600">Model: {item.modelNumber}</p>
                      </div>
                    </div>

                    <div className="text-sm text-slate-700">
                      <p className="text-slate-500">Purchase Date</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatApiDate(item.purchaseDate)}</p>
                    </div>

                    <div className="text-sm text-slate-700">
                      <p className="text-slate-500">Warranty Start</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatApiDate(item.warrantyStartDate)}</p>
                    </div>

                    <div className="text-sm text-slate-700">
                      <p className="text-slate-500">Warranty End</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatApiDate(item.warrantyEndDate)}</p>
                      <p className="mt-1 text-xs text-slate-500">Purchase Source: {item.purchaseSource}</p>
                    </div>

                    <div className="flex items-center justify-start lg:justify-end">
                      <WarrantyStatusBadge status={item.status} />
                    </div>
                  </div>
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
