import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import GlobalLoadingSpinner from '../components/GlobalLoadingSpinner';

// Public layout for booking pages, landing page
// Mobile-first design

const PublicLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 safe-area-top safe-area-bottom">
      <GlobalLoadingSpinner />

      {/* Simple header for public pages - mobile-first */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container-dashboard py-3 sm:py-4">
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
        </div>
      </header>

      {/* Main content area - responsive padding */}
      <main className="container-dashboard py-4 sm:py-6 md:py-8 scroll-smooth-touch">
        <Outlet />
      </main>

      {/* Simple footer - responsive */}
      <footer className="mt-auto bg-gray-900">
        <div className="container-dashboard py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Agendux. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
