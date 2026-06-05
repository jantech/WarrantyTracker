import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/home/Footer';
import PageContainer from '../../components/ui/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function RegistrationSuccessPage() {
  const { registrationId } = useParams();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <PageContainer className="pt-10">
        <Card className="mx-auto w-full max-w-2xl px-8 py-10 text-center">
          <img src="/images/success-check.svg" alt="Registration success" className="mx-auto h-28 w-28" />
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-blue-950">Warranty registered successfully!</h1>
          <p className="mt-2 text-slate-600">Your warranty has been registered.</p>

          <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
            <p className="text-sm font-medium text-slate-700">Registration ID</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-700">{registrationId ?? 'N/A'}</p>
          </div>

          <div className="mt-8 space-y-3">
            <Link to="/search" className="block">
              <Button variant="secondary" className="w-full justify-center border-blue-300 text-blue-950">View My Warranties</Button>
            </Link>
            <Link to="/register" className="block">
              <Button className="w-full justify-center bg-blue-700 text-white hover:bg-blue-800">Register Another Warranty</Button>
            </Link>
            <Link to="/" className="block pt-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
              Go to Home
            </Link>
          </div>
        </Card>
      </PageContainer>
      <Footer />
    </div>
  );
}
