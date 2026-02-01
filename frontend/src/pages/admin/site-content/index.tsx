import { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Alert, Snackbar } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../store';
import { clearSiteContentError, clearSiteContentSuccess } from '../../../store/slices/siteContentSlice';
import HeroEditor from './HeroEditor';
import CTAEditor from './CTAEditor';
import FeaturesEditor from './FeaturesEditor';
import FAQsEditor from './FAQsEditor';

// RULE: Page folder structure - index.tsx + flat components (NO subdirectories)
// RULE: Page load → dispatch action → API call → state updates → component renders
// RULE: NO direct API calls from component - all through Redux

const AdminSiteContentPage = () => {
  const dispatch = useAppDispatch();
  const { error, successMessage } = useAppSelector((state) => state.siteContent);
  const [activeTab, setActiveTab] = useState(0);

  // Clear messages on unmount
  useEffect(() => {
    return () => {
      dispatch(clearSiteContentError());
      dispatch(clearSiteContentSuccess());
    };
  }, [dispatch]);

  const handleCloseError = () => {
    dispatch(clearSiteContentError());
  };

  const handleCloseSuccess = () => {
    dispatch(clearSiteContentSuccess());
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Contenido del Sitio</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administrá el contenido de la landing page de Agendux
          </p>
        </div>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="Site content tabs"
          >
            <Tab label="Hero" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Features" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="FAQ" id="tab-2" aria-controls="tabpanel-2" />
            <Tab label="CTA" id="tab-3" aria-controls="tabpanel-3" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <div role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
          {activeTab === 0 && <HeroEditor />}
        </div>
        <div role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
          {activeTab === 1 && <FeaturesEditor />}
        </div>
        <div role="tabpanel" hidden={activeTab !== 2} id="tabpanel-2" aria-labelledby="tab-2">
          {activeTab === 2 && <FAQsEditor />}
        </div>
        <div role="tabpanel" hidden={activeTab !== 3} id="tabpanel-3" aria-labelledby="tab-3">
          {activeTab === 3 && <CTAEditor />}
        </div>
      </div>

      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar open={!!successMessage} autoHideDuration={4000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminSiteContentPage;
