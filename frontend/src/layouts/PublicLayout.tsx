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
        <div className="container-dashboard py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo on the left */}
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

            {/* Right side buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                /* Dashboard button for logged-in users */
                <Button
                  onClick={() => navigate(getDashboardPath())}
                  variant="contained"
                  startIcon={<DashboardIcon />}
                  sx={{
                    textTransform: 'none',
                    bgcolor: 'white',
                    color: '#2563eb',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.75, sm: 1 },
                    '&:hover': {
                      bgcolor: '#f0f9ff',
                    },
                  }}
                >
                  Dashboard
                </Button>
              ) : (
                /* Dudas, Login and Start buttons for non-authenticated users */
                <>
                  <Button
                    onClick={() => navigate('/dudas')}
                    variant="text"
                    sx={{
                      textTransform: 'none',
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                      px: { xs: 0.75, sm: 1.5 },
                      minWidth: 'auto',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                      },
                    }}
                  >
                    Dudas
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="text"
                    sx={{
                      textTransform: 'none',
                      color: 'white',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      px: { xs: 1, sm: 2 },
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Ingresar
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    variant="contained"
                    sx={{
                      textTransform: 'none',
                      bgcolor: 'white',
                      color: '#2563eb',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      px: { xs: 1.5, sm: 2.5 },
                      py: { xs: 0.5, sm: 0.75 },
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: '#f0f9ff',
                      },
                    }}
                  >
                    Comenzar Gratis
                  </Button>
                </>
              )}
            </div>
          </div>
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
