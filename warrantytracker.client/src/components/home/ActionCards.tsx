import { Link } from "react-router-dom";
import { ArrowRight, FilePlus2, Search } from "lucide-react";
import Card from "../ui/Card";
import PageContainer from "../ui/PageContainer";

export default function ActionCards() {
  return (
    <section className="pb-6 pt-2">
      <PageContainer className="py-0">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Link to="/register" className="group">
            <Card className="h-full border-slate-200 p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
                <FilePlus2 size={30} />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-blue-950">Register Warranty</h3>
              <p className="mt-2 max-w-sm text-slate-600">
                Register a new device warranty with your purchase details.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white">
                Register Now <ArrowRight size={16} />
              </span>
            </Card>
          </Link>

          <Link to="/search" className="group">
            <Card className="h-full border-slate-200 p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <Search size={30} />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-blue-950">Search Warranty</h3>
              <p className="mt-2 max-w-sm text-slate-600">
                Search your registered warranties using mobile number.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                Search Now <ArrowRight size={16} />
              </span>
            </Card>
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}