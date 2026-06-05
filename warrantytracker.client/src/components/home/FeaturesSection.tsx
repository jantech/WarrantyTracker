import {
  ShieldCheck,
  Smartphone,
  FileText
} from "lucide-react";
import Card from "../ui/Card";
import PageContainer from "../ui/PageContainer";

export default function FeaturesSection() {
  return (
    <section className="pb-4 pt-0">
      <PageContainer className="py-0">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card className="flex items-start gap-3 border-slate-200 p-4">
            <div className="rounded-full bg-blue-50 p-3 text-blue-700">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-blue-950">Easy Registration</h3>
              <p className="mt-1 text-sm text-slate-600">Simple and quick warranty registration</p>
            </div>
          </Card>

          <Card className="flex items-start gap-3 border-slate-200 p-4">
            <div className="rounded-full bg-violet-50 p-3 text-violet-700">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-blue-950">Track Anywhere</h3>
              <p className="mt-1 text-sm text-slate-600">Access your warranty details anytime</p>
            </div>
          </Card>

          <Card className="flex items-start gap-3 border-slate-200 p-4">
            <div className="rounded-full bg-emerald-50 p-3 text-emerald-700">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-blue-950">Secure & Reliable</h3>
              <p className="mt-1 text-sm text-slate-600">Your data is safe and protected</p>
            </div>
          </Card>
        </div>
      </PageContainer>
    </section>
  );
}