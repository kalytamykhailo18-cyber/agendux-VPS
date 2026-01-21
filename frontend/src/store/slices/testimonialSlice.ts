import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';
import { startLoading, stopLoading } from './loadingSlice';

// RULE: All API calls go through Redux, NO direct calls from components
// RULE: Global loading spinner for all requests

// ============================================
// TYPES
// ============================================

export interface Testimonial {
  id: string;
  name: string;
  profession: string;
  rating: number;
  review: string;
  photo?: string;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTestimonialData {
  name: string;
  profession: string;
  rating: number;
  review: string;
  photo?: string;
  displayOrder?: number;
}

export interface UpdateTestimonialData {
  name?: string;
  profession?: string;
  rating?: number;
  review?: string;
  photo?: string;
  isActive?: boolean;
  displayOrder?: number;
}

// ============================================
// STATE
// ============================================

interface TestimonialState {
  publicTestimonials: Testimonial[];
  adminTestimonials: Testimonial[];
  currentTestimonial: Testimonial | null;
  error: string | null;
  successMessage: string | null;
}

const initialState: TestimonialState = {
  publicTestimonials: [],
  adminTestimonials: [],
  currentTestimonial: null,
  error: null,
  successMessage: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

// Get public testimonials (for homepage)
export const getPublicTestimonials = createAsyncThunk(
  'testimonial/getPublicTestimonials',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.get('/testimonials');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al obtener testimonios');
    } finally {
      dispatch(stopLoading());
    }
  }
);

// Get all testimonials (admin only)
export const getAdminTestimonials = createAsyncThunk(
  'testimonial/getAdminTestimonials',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.get('/testimonials/admin');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al obtener testimonios');
    } finally {
      dispatch(stopLoading());
    }
  }
);

// Get testimonial by ID
export const getTestimonial = createAsyncThunk(
  'testimonial/getTestimonial',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.get(`/testimonials/admin/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al obtener testimonio');
    } finally {
      dispatch(stopLoading());
    }
  }
);

// Create testimonial
export const createTestimonial = createAsyncThunk(
  'testimonial/createTestimonial',
  async (data: CreateTestimonialData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.post('/testimonials/admin', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al crear testimonio');
    } finally {
      dispatch(stopLoading());
    }
  }
);

// Update testimonial
export const updateTestimonial = createAsyncThunk(
  'testimonial/updateTestimonial',
  async ({ id, data }: { id: string; data: UpdateTestimonialData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.put(`/testimonials/admin/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al actualizar testimonio');
    } finally {
      dispatch(stopLoading());
    }
  }
);

// Delete testimonial
export const deleteTestimonial = createAsyncThunk(
  'testimonial/deleteTestimonial',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      await api.delete(`/testimonials/admin/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al eliminar testimonio');
    } finally {
      dispatch(stopLoading());
    }
  }
);

// Reorder testimonials
export const reorderTestimonials = createAsyncThunk(
  'testimonial/reorderTestimonials',
  async (orders: { id: string; displayOrder: number }[], { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      await api.post('/testimonials/admin/reorder', { orders });
      return orders;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al reordenar testimonios');
    } finally {
      dispatch(stopLoading());
    }
  }
);

// ============================================
// SLICE
// ============================================

const testimonialSlice = createSlice({
  name: 'testimonial',
  initialState,
  reducers: {
    clearTestimonialError: (state) => {
      state.error = null;
    },
    clearTestimonialSuccess: (state) => {
      state.successMessage = null;
    },
    clearCurrentTestimonial: (state) => {
      state.currentTestimonial = null;
    },
  },
  extraReducers: (builder) => {
    // Get public testimonials
    builder.addCase(getPublicTestimonials.fulfilled, (state, action) => {
      state.publicTestimonials = action.payload;
      state.error = null;
    });
    builder.addCase(getPublicTestimonials.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Get admin testimonials
    builder.addCase(getAdminTestimonials.fulfilled, (state, action) => {
      state.adminTestimonials = action.payload;
      state.error = null;
    });
    builder.addCase(getAdminTestimonials.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Get testimonial by ID
    builder.addCase(getTestimonial.fulfilled, (state, action) => {
      state.currentTestimonial = action.payload;
      state.error = null;
    });
    builder.addCase(getTestimonial.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Create testimonial
    builder.addCase(createTestimonial.fulfilled, (state, action) => {
      state.adminTestimonials.push(action.payload);
      state.successMessage = 'Testimonio creado correctamente';
      state.error = null;
    });
    builder.addCase(createTestimonial.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Update testimonial
    builder.addCase(updateTestimonial.fulfilled, (state, action) => {
      const index = state.adminTestimonials.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.adminTestimonials[index] = action.payload;
      }
      state.successMessage = 'Testimonio actualizado correctamente';
      state.error = null;
    });
    builder.addCase(updateTestimonial.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Delete testimonial
    builder.addCase(deleteTestimonial.fulfilled, (state, action) => {
      state.adminTestimonials = state.adminTestimonials.filter((t) => t.id !== action.payload);
      state.successMessage = 'Testimonio eliminado correctamente';
      state.error = null;
    });
    builder.addCase(deleteTestimonial.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Reorder testimonials
    builder.addCase(reorderTestimonials.fulfilled, (state, action) => {
      // Update displayOrder in state
      action.payload.forEach((order) => {
        const testimonial = state.adminTestimonials.find((t) => t.id === order.id);
        if (testimonial) {
          testimonial.displayOrder = order.displayOrder;
        }
      });
      // Re-sort by displayOrder
      state.adminTestimonials.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      state.successMessage = 'Testimonios reordenados correctamente';
      state.error = null;
    });
    builder.addCase(reorderTestimonials.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { clearTestimonialError, clearTestimonialSuccess, clearCurrentTestimonial } =
  testimonialSlice.actions;

export default testimonialSlice.reducer;
