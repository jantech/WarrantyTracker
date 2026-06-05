import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/Home/HomePage';
import RegisterWarrantyPage from '../pages/RegisterWarranty/RegisterWarrantyPage';
import RegistrationSuccessPage from '../pages/RegistrationSuccess/RegistrationSuccessPage';
import SearchWarrantyPage from '../pages/SearchWarranty/SearchWarrantyPage';
import WarrantyResultsPage from '../pages/WarrantyResults/WarrantyResultsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterWarrantyPage />} />
      <Route path="/register-success/:registrationId" element={<RegistrationSuccessPage />} />
      <Route path="/search" element={<SearchWarrantyPage />} />
      <Route path="/results" element={<WarrantyResultsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
