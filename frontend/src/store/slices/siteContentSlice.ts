import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';
import { startLoading, stopLoading } from './loadingSlice';
import type {
  SiteContent,
  HeroContent,
  CTAContent,
  Feature,
  FAQ,
  CreateFeatureDTO,
  UpdateFeatureDTO,
  CreateFAQDTO,
  UpdateFAQDTO,
  ReorderItem,
} from '../../types/site-content';

// RULE: All API calls go through Redux, NO direct calls from components
// RULE: Global loading spinner for all requests

// ============================================
// STATE
// ============================================

interface SiteContentState {
  // Public content (for landing page)
  content: SiteContent | null;

  // Admin edit states
  adminHero: HeroContent | null;
  adminCTA: CTAContent | null;
  adminFeatures: Feature[];
  adminFAQs: FAQ[];

  error: string | null;
  successMessage: string | null;
}

const initialState: SiteContentState = {
  content: null,
  adminHero: null,
  adminCTA: null,
  adminFeatures: [],
  adminFAQs: [],
  error: null,
  successMessage: null,
};

// ============================================
// PUBLIC THUNKS
// ============================================

// Get all site content for landing page
export const getSiteContent = createAsyncThunk(
  'siteContent/getSiteContent',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.get('/site-content');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar contenido');
    } finally {
      dispatch(stopLoading());
    }
  }
);

// ============================================
// ADMIN THUNKS - Hero
// ============================================

export const getAdminHero = createAsyncThunk(
  'siteContent/getAdminHero',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.get('/site-content/admin/hero');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar hero');
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const updateAdminHero = createAsyncThunk(
  'siteContent/updateAdminHero',
  async (data: HeroContent, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.put('/site-content/admin/hero', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al actualizar hero');
    } finally {
      dispatch(stopLoading());
    }
  }
);

// ============================================
// ADMIN THUNKS - CTA
// ============================================

export const getAdminCTA = createAsyncThunk(
  'siteContent/getAdminCTA',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.get('/site-content/admin/cta');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar CTA');
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const updateAdminCTA = createAsyncThunk(
  'siteContent/updateAdminCTA',
  async (data: CTAContent, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.put('/site-content/admin/cta', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al actualizar CTA');
    } finally {
      dispatch(stopLoading());
    }
  }
);

// ============================================
// ADMIN THUNKS - Features
// ============================================

export const getAdminFeatures = createAsyncThunk(
  'siteContent/getAdminFeatures',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.get('/site-content/admin/features');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar features');
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const createAdminFeature = createAsyncThunk(
  'siteContent/createAdminFeature',
  async (data: CreateFeatureDTO, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.post('/site-content/admin/features', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al crear feature');
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const updateAdminFeature = createAsyncThunk(
  'siteContent/updateAdminFeature',
  async ({ id, data }: { id: string; data: UpdateFeatureDTO }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.put(`/site-content/admin/features/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al actualizar feature');
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const deleteAdminFeature = createAsyncThunk(
  'siteContent/deleteAdminFeature',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      await api.delete(`/site-content/admin/features/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al eliminar feature');
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const reorderAdminFeatures = createAsyncThunk(
  'siteContent/reorderAdminFeatures',
  async (orders: ReorderItem[], { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.post('/site-content/admin/features/reorder', { orders });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al reordenar features');
    } finally {
      dispatch(stopLoading());
    }
  }
);

// ============================================
// ADMIN THUNKS - FAQs
// ============================================

export const getAdminFAQs = createAsyncThunk(
  'siteContent/getAdminFAQs',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.get('/site-content/admin/faqs');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar FAQs');
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const createAdminFAQ = createAsyncThunk(
  'siteContent/createAdminFAQ',
  async (data: CreateFAQDTO, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.post('/site-content/admin/faqs', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al crear FAQ');
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const updateAdminFAQ = createAsyncThunk(
  'siteContent/updateAdminFAQ',
  async ({ id, data }: { id: string; data: UpdateFAQDTO }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.put(`/site-content/admin/faqs/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al actualizar FAQ');
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const deleteAdminFAQ = createAsyncThunk(
  'siteContent/deleteAdminFAQ',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      await api.delete(`/site-content/admin/faqs/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al eliminar FAQ');
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const reorderAdminFAQs = createAsyncThunk(
  'siteContent/reorderAdminFAQs',
  async (orders: ReorderItem[], { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.post('/site-content/admin/faqs/reorder', { orders });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al reordenar FAQs');
    } finally {
      dispatch(stopLoading());
    }
  }
);

// ============================================
// SLICE
// ============================================

const siteContentSlice = createSlice({
  name: 'siteContent',
  initialState,
  reducers: {
    clearSiteContentError: (state) => {
      state.error = null;
    },
    clearSiteContentSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Public content
    builder.addCase(getSiteContent.fulfilled, (state, action) => {
      state.content = action.payload;
      state.error = null;
    });
    builder.addCase(getSiteContent.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Admin Hero
    builder.addCase(getAdminHero.fulfilled, (state, action) => {
      state.adminHero = action.payload;
      state.error = null;
    });
    builder.addCase(getAdminHero.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(updateAdminHero.fulfilled, (state, action) => {
      state.adminHero = action.payload;
      state.successMessage = 'Hero actualizado correctamente';
      state.error = null;
    });
    builder.addCase(updateAdminHero.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Admin CTA
    builder.addCase(getAdminCTA.fulfilled, (state, action) => {
      state.adminCTA = action.payload;
      state.error = null;
    });
    builder.addCase(getAdminCTA.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(updateAdminCTA.fulfilled, (state, action) => {
      state.adminCTA = action.payload;
      state.successMessage = 'CTA actualizado correctamente';
      state.error = null;
    });
    builder.addCase(updateAdminCTA.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Admin Features
    builder.addCase(getAdminFeatures.fulfilled, (state, action) => {
      state.adminFeatures = action.payload;
      state.error = null;
    });
    builder.addCase(getAdminFeatures.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(createAdminFeature.fulfilled, (state, action) => {
      state.adminFeatures.push(action.payload);
      state.successMessage = 'Feature creado correctamente';
      state.error = null;
    });
    builder.addCase(createAdminFeature.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(updateAdminFeature.fulfilled, (state, action) => {
      const index = state.adminFeatures.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) {
        state.adminFeatures[index] = action.payload;
      }
      state.successMessage = 'Feature actualizado correctamente';
      state.error = null;
    });
    builder.addCase(updateAdminFeature.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(deleteAdminFeature.fulfilled, (state, action) => {
      state.adminFeatures = state.adminFeatures.filter((f) => f.id !== action.payload);
      state.successMessage = 'Feature eliminado correctamente';
      state.error = null;
    });
    builder.addCase(deleteAdminFeature.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(reorderAdminFeatures.fulfilled, (state, action) => {
      state.adminFeatures = action.payload;
      state.successMessage = 'Features reordenados correctamente';
      state.error = null;
    });
    builder.addCase(reorderAdminFeatures.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Admin FAQs
    builder.addCase(getAdminFAQs.fulfilled, (state, action) => {
      state.adminFAQs = action.payload;
      state.error = null;
    });
    builder.addCase(getAdminFAQs.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(createAdminFAQ.fulfilled, (state, action) => {
      state.adminFAQs.push(action.payload);
      state.successMessage = 'FAQ creado correctamente';
      state.error = null;
    });
    builder.addCase(createAdminFAQ.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(updateAdminFAQ.fulfilled, (state, action) => {
      const index = state.adminFAQs.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) {
        state.adminFAQs[index] = action.payload;
      }
      state.successMessage = 'FAQ actualizado correctamente';
      state.error = null;
    });
    builder.addCase(updateAdminFAQ.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(deleteAdminFAQ.fulfilled, (state, action) => {
      state.adminFAQs = state.adminFAQs.filter((f) => f.id !== action.payload);
      state.successMessage = 'FAQ eliminado correctamente';
      state.error = null;
    });
    builder.addCase(deleteAdminFAQ.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(reorderAdminFAQs.fulfilled, (state, action) => {
      state.adminFAQs = action.payload;
      state.successMessage = 'FAQs reordenados correctamente';
      state.error = null;
    });
    builder.addCase(reorderAdminFAQs.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { clearSiteContentError, clearSiteContentSuccess } = siteContentSlice.actions;

export default siteContentSlice.reducer;
