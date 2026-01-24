import { IconButton, Chip, Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StarIcon from '@mui/icons-material/Star';
import type { Testimonial } from '../../../store/slices/testimonialSlice';

// RULE: Layout with Tailwind, interactive components with MUI

interface TestimonialsTableProps {
  testimonials: Testimonial[];
  onEdit: (testimonial: Testimonial) => void;
  onToggleActive: (testimonial: Testimonial) => void;
  onDelete: (testimonial: Testimonial) => void;
}

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length >= 2) {
    return names[0][0] + names[names.length - 1][0];
  }
  return name.slice(0, 2);
};

const TestimonialsTable = ({
  testimonials,
  onEdit,
  onToggleActive,
  onDelete,
}: TestimonialsTableProps) => {
  if (testimonials.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow">
        <p className="text-gray-500">No hay testimonios creados aún</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profesional
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Calificación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reseña
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orden
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {testimonials.map((testimonial) => (
              <tr key={testimonial.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {testimonial.photo ? (
                      <Avatar src={testimonial.photo} alt={testimonial.name} />
                    ) : (
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getInitials(testimonial.name)}
                      </Avatar>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.profession}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <StarIcon sx={{ fontSize: 18, color: '#FFC107' }} />
                    <span className="text-sm text-gray-900">{testimonial.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700 line-clamp-2 max-w-md">
                    {testimonial.review}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Chip
                    label={testimonial.isActive ? 'Activo' : 'Inactivo'}
                    color={testimonial.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-700">{testimonial.displayOrder}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    <IconButton
                      size="small"
                      onClick={() => onToggleActive(testimonial)}
                      title={testimonial.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {testimonial.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(testimonial)}
                      color="primary"
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(testimonial)}
                      color="error"
                      title="Eliminar"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="block md:hidden divide-y divide-gray-200">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="p-4">
            <div className="flex items-start gap-3 mb-3">
              {testimonial.photo ? (
                <Avatar src={testimonial.photo} alt={testimonial.name} />
              ) : (
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {getInitials(testimonial.name)}
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.profession}</div>
                <div className="flex items-center gap-1 mt-1">
                  <StarIcon sx={{ fontSize: 16, color: '#FFC107' }} />
                  <span className="text-sm text-gray-700">{testimonial.rating}</span>
                </div>
              </div>
              <Chip
                label={testimonial.isActive ? 'Activo' : 'Inactivo'}
                color={testimonial.isActive ? 'success' : 'default'}
                size="small"
              />
            </div>

            <p className="text-sm text-gray-700 line-clamp-3 mb-3">{testimonial.review}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Orden: {testimonial.displayOrder}</span>
              <div className="flex items-center gap-1">
                <IconButton
                  size="small"
                  onClick={() => onToggleActive(testimonial)}
                  title={testimonial.isActive ? 'Desactivar' : 'Activar'}
                >
                  {testimonial.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onEdit(testimonial)}
                  color="primary"
                  title="Editar"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete(testimonial)}
                  color="error"
                  title="Eliminar"
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsTable;
