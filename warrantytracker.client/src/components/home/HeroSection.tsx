import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import PageContainer from "../ui/PageContainer";

export default function HeroSection() {
  return (
    <section className="py-4 sm:py-6">
      <PageContainer className="py-0">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              Welcome to
            </span>
            <div className="space-y-3">
              <h1 className="max-w-xl text-4xl font-extrabold tracking-tight text-blue-950 sm:text-5xl">
                Warranty Tracker
              </h1>
              <p className="max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                Register your JP Solar products and track your warranty details in one place.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link to="/register">
                <Button size="lg" className="min-w-44 bg-blue-700 text-white hover:bg-blue-800">
                  Register Now <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
              <Link to="/search">
                <Button size="lg" variant="secondary" className="min-w-44 border-blue-200 text-blue-900 hover:bg-blue-50">
                  Search Warranty
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-0 -z-10 mx-auto h-[88%] w-[88%] rounded-full bg-blue-100/80 blur-3xl" />
            <img
              src="/images/hero-warranty.svg"
              alt="Warranty illustration showing solar products and a shield"
              className="w-full max-w-140 drop-shadow-[0_20px_30px_rgba(29,78,216,0.14)]"
            />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}