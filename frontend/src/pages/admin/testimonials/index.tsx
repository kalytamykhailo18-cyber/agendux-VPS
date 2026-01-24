import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  clearTestimonialError,
  clearTestimonialSuccess,
} from '../../../store/slices/testimonialSlice';
import type { Testimonial, CreateTestimonialData } from '../../../store/slices/testimonialSlice';
import TestimonialsHeader from './TestimonialsHeader';
import TestimonialsTable from './TestimonialsTable';
import TestimonialFormModal from './TestimonialFormModal';

// RULE: Page folder structure - index.tsx + flat components (NO subdirectories)
// RULE: Page load → dispatch action → API call → state updates → component renders
// RULE: NO direct API calls from component
// RULE: Global loading spinner during requests

const AdminTestimonialsPage = () => {
  const dispatch = useAppDispatch();
  const { adminTestimonials, error, successMessage } = useAppSelector((state) => state.testimonial);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Load testimonials
  useEffect(() => {
    dispatch(getAdminTestimonials());
  }, [dispatch]);

  // Cleanup
  useEffect(() => {
    return () => {
      dispatch(clearTestimonialError());
      dispatch(clearTestimonialSuccess());
    };
  }, [dispatch]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearTestimonialSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // Open modal for new testimonial
  const handleNew = () => {
    setEditingTestimonial(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
  };

  // Save testimonial
  const handleSave = async (data: CreateTestimonialData) => {
    if (editingTestimonial) {
      await dispatch(updateTestimonial({ id: editingTestimonial.id, data }));
    } else {
      await dispatch(createTestimonial(data));
    }
    handleCloseModal();
  };

  // Toggle active status
  const handleToggleActive = async (testimonial: Testimonial) => {
    await dispatch(
      updateTestimonial({
        id: testimonial.id,
        data: { isActive: !testimonial.isActive },
      })
    );
  };

  // Delete testimonial
  const handleDelete = async (testimonial: Testimonial) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el testimonio de "${testimonial.name}"?`)) {
      await dispatch(deleteTestimonial(testimonial.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <TestimonialsHeader onNew={handleNew} successMessage={successMessage} error={error} />

        <TestimonialsTable
          testimonials={adminTestimonials}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />

        <TestimonialFormModal
          isOpen={isModalOpen}
          testimonial={editingTestimonial}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default AdminTestimonialsPage;
