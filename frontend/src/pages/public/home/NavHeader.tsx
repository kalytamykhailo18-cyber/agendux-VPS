import { Button } from '@mui/material';

interface NavHeaderProps {
  onStartFree: () => void;
  onAdminAccess: () => void;
}

const NavHeader = ({ onStartFree, onAdminAccess }: NavHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/logo2.png"
              alt="Agendux"
              className="h-8 sm:h-10 w-auto"
            />
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="text"
              onClick={onAdminAccess}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                textTransform: 'none',
                color: '#4b5563',
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                },
              }}
            >
              Admin
            </Button>
            <Button
              variant="contained"
              onClick={onStartFree}
              sx={{
                textTransform: 'none',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 2, sm: 3 },
              }}
            >
              Comenzar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
