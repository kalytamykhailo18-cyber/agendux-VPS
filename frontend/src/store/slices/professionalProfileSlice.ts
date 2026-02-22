import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../config/api';
import type { ApiResponse } from '../../types';
import { startLoading, stopLoading } from './loadingSlice';

// RULE: All API calls go through Redux, NO direct calls from components

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string | null;
  addressStreet: string | null;
  addressCity: string | null;
}

interface ProfileState {
  firstName: string;
  lastName: string;
  phone: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  error: string | null;
  lastFetched: number | null;
}

interface UpdateProfileRequest {
  addressStreet?: string | null;
  addressCity?: string | null;
}

const initialState: ProfileState = {
  firstName: '',
  lastName: '',
  phone: null,
  addressStreet: null,
  addressCity: null,
  error: null,
  lastFetched: null
};

// Get profile
export const getProfile = createAsyncThunk<
  ProfileData,
  void,
  { rejectValue: string }
>(
  'professionalProfile/getProfile',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.get<ApiResponse<ProfileData>>('/professional/profile');

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return rejectWithValue(response.data.error || 'Error al obtener perfil');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const message = err.response?.data?.error || 'Error al obtener perfil';
      return rejectWithValue(message);
    } finally {
      dispatch(stopLoading());
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk<
  ProfileData,
  UpdateProfileRequest,
  { rejectValue: string }
>(
  'professionalProfile/updateProfile',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await api.put<ApiResponse<ProfileData>>('/professional/profile', data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return rejectWithValue(response.data.error || 'Error al actualizar perfil');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const message = err.response?.data?.error || 'Error al actualizar perfil';
      return rejectWithValue(message);
    } finally {
      dispatch(stopLoading());
    }
  }
);

const professionalProfileSlice = createSlice({
  name: 'professionalProfile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Get profile
    builder
      .addCase(getProfile.fulfilled, (state, action: PayloadAction<ProfileData>) => {
        state.firstName = action.payload.firstName;
        state.lastName = action.payload.lastName;
        state.phone = action.payload.phone;
        state.addressStreet = action.payload.addressStreet;
        state.addressCity = action.payload.addressCity;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.error = action.payload || 'Error al obtener perfil';
      });

    // Update profile
    builder
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<ProfileData>) => {
        state.firstName = action.payload.firstName;
        state.lastName = action.payload.lastName;
        state.phone = action.payload.phone;
        state.addressStreet = action.payload.addressStreet;
        state.addressCity = action.payload.addressCity;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload || 'Error al actualizar perfil';
      });
  }
});

export const { clearProfileError } = professionalProfileSlice.actions;
export default professionalProfileSlice.reducer;
