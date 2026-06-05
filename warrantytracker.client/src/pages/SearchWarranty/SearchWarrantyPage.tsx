import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/home/Footer';
import PageContainer from '../../components/ui/PageContainer';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const searchSchema = z.object({
  mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function SearchWarrantyPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      mobileNumber: '',
    },
  });

  const onSubmit = async (values: SearchFormValues) => {
    navigate(`/results?mobile=${values.mobileNumber}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <PageContainer className="pt-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex justify-center lg:justify-start">
            <img src="/images/search-warranty.svg" alt="Search warranty illustration" className="w-full max-w-105" />
          </div>

          <Card className="w-full max-w-xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Search Warranty</h1>
            <p className="mt-2 max-w-md text-slate-600">Enter your mobile number to view all your registered warranties.</p>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Mobile Number *"
                id="mobileNumber"
                placeholder="Enter mobile number"
                error={errors.mobileNumber?.message}
                {...register('mobileNumber')}
              />
              <p className="text-sm text-slate-500">e.g., 9876543210</p>
              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Search
              </Button>
            </form>

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              How it works? Enter the mobile number used during warranty registration to view all your registered warranties.
            </div>
          </Card>
        </div>
      </PageContainer>
      <Footer />
    </div>
  );
}
