import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GlobalLoadingSpinner from '../components/GlobalLoadingSpinner';
import { useAppSelector } from '../store';
import { UserRole } from '../types';

// Public layout for booking pages, landing page
// Mobile-first design

const PublicLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Determine dashboard path based on user role
  const getDashboardPath = () => {
    if (user?.role === UserRole.ADMIN) {
      return '/admin/dashboard';
    }
    return '/professional/calendar';
  };

  return (
    <div className="min-h-screen bg-gray-50 safe-area-top safe-area-bottom">
      <GlobalLoadingSpinner />

      {/* Simple header for public pages - mobile-first */}
      <header className="bg-blue-600 shadow-sm sticky top-0 z-10">
        <div className="container-dashboard py-3 sm:py-4 flex items-center justify-between">
          <Button
            onClick={() => navigate('/')}
            sx={{
              padding: 0,
              minWidth: 'auto',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <img src="/logo2.png" alt="Agendux" className="h-8 sm:h-10 w-auto" />
          </Button>

          {/* Dashboard button for logged-in users */}
          {isAuthenticated && (
            <Button
              onClick={() => navigate(getDashboardPath())}
              variant="contained"
              startIcon={<DashboardIcon />}
              sx={{
                textTransform: 'none',
                bgcolor: 'white',
                color: '#2563eb',
                '&:hover': {
                  bgcolor: '#f0f9ff',
                },
              }}
            >
              Dashboard
            </Button>
          )}
        </div>
      </header>

      {/* Main content area - responsive padding */}
      <main className="container-dashboard py-4 sm:py-6 md:py-8 scroll-smooth-touch">
        <Outlet />
      </main>

      {/* Simple footer - responsive */}
      <footer className="mt-auto bg-gray-900">
        <div className="container-dashboard py-4 sm:py-6 text-center">
          <img src="/logo2.png" alt="Agendux" className="h-8 w-auto mx-auto mb-3 opacity-80" />
          <p className="text-xs sm:text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Agendux. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
