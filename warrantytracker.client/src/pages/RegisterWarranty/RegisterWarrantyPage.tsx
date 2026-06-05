import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Upload } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/home/Footer';
import PageContainer from '../../components/ui/PageContainer';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { warrantyService } from '../../services/warrantyService';
import type { Device, PurchaseSource, WarrantyRegistration } from '../../types/warranty';

const registerSchema = z.object({
  ownerName: z.string().min(1, 'Owner name is required'),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
  emailAddress: z.union([z.string().email('Please enter a valid email'), z.literal('')]).optional(),
  deviceId: z.string().min(1, 'Device is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  purchaseSourceId: z.string().min(1, 'Purchase source is required'),
  invoiceFile: z.any().optional(),
  notes: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterWarrantyPage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [sources, setSources] = useState<PurchaseSource[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      ownerName: '',
      mobileNumber: '',
      emailAddress: '',
      deviceId: '',
      purchaseDate: '',
      purchaseSourceId: '',
      notes: '',
    },
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [deviceData, sourceData] = await Promise.all([
          warrantyService.getDevices(),
          warrantyService.getPurchaseSources(),
        ]);
        setDevices(deviceData);
        setSources(sourceData);
      } catch {
        setPageError('Unable to load form options. Please refresh and try again.');
      }
    };

    void loadOptions();
  }, []);

  const onSubmit = async (values: RegisterFormValues) => {
    setPageError(null);

    try {
      const payload: WarrantyRegistration = {
        ownerName: values.ownerName,
        mobileNumber: values.mobileNumber,
        emailAddress: values.emailAddress || undefined,
        deviceId: Number.parseInt(values.deviceId, 10),
        purchaseDate: values.purchaseDate,
        purchaseSourceId: Number.parseInt(values.purchaseSourceId, 10),
        notes: values.notes || undefined,
        invoiceFile: values.invoiceFile?.[0] as File | undefined,
      };

      const result = await warrantyService.registerWarranty(payload);
      navigate(`/register-success/${result.id}`);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to register warranty. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <PageContainer className="pt-6">
        <div className="mb-5 flex items-center gap-3 text-blue-950">
          <button type="button" onClick={() => navigate('/')} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
            ←
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Register Warranty</h1>
            <p className="mt-1 text-slate-600">Enter the details below to register your product warranty.</p>
          </div>
        </div>

        {pageError ? (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5" size={18} />
            <p>{pageError}</p>
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.25fr]">
            <Card className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-blue-950">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-blue-700">👤</span>
                <h2 className="font-bold">Owner Information</h2>
              </div>
              <Input label="Owner Name *" id="ownerName" placeholder="Enter owner full name" error={errors.ownerName?.message} {...register('ownerName')} />
              <Input label="Mobile Number *" id="mobileNumber" placeholder="Enter mobile number" error={errors.mobileNumber?.message} {...register('mobileNumber')} />
              <Input label="Email Address" id="emailAddress" type="email" placeholder="Enter email address (optional)" error={errors.emailAddress?.message} {...register('emailAddress')} />

              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Warranty Start Date will be the date you register on our portal.
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-blue-950">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-blue-700">📦</span>
                <h2 className="font-bold">Device & Purchase Information</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Device *"
                  id="deviceId"
                  placeholder="Select device"
                  error={errors.deviceId?.message}
                  options={devices.map((device) => ({ label: `${device.brand} ${device.name}`, value: device.id.toString() }))}
                  {...register('deviceId')}
                />

                <Input
                  label="Purchase Date *"
                  id="purchaseDate"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  error={errors.purchaseDate?.message}
                  {...register('purchaseDate')}
                />

                <Select
                  label="Purchase Source *"
                  id="purchaseSourceId"
                  placeholder="Select purchase source"
                  error={errors.purchaseSourceId?.message}
                  options={sources.map((source) => ({ label: source.name, value: source.id.toString() }))}
                  {...register('purchaseSourceId')}
                />

                <label htmlFor="invoiceFile" className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Invoice File (Optional)</span>
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Upload size={16} className="text-blue-600" />
                      <span>Choose file or drag and drop</span>
                    </div>
                    <input id="invoiceFile" type="file" className="mt-3 w-full text-sm text-slate-700" {...register('invoiceFile')} />
                    <p className="mt-2 text-xs text-slate-500">Max size: 2MB (PDF, JPG, PNG)</p>
                  </div>
                </label>
              </div>

              <label htmlFor="notes" className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Notes (Optional)</span>
                <textarea
                  id="notes"
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter any additional notes..."
                  {...register('notes')}
                />
              </label>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button type="submit" size="lg" isLoading={isSubmitting} className="min-w-72 shadow-sm">
              Register Warranty
            </Button>
          </div>
        </form>
      </PageContainer>
      <Footer />
    </div>
  );
}
