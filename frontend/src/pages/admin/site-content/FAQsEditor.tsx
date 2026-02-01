import { useEffect, useState } from 'react';
import {
  Button,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  getAdminFAQs,
  deleteAdminFAQ,
  updateAdminFAQ,
  reorderAdminFAQs,
} from '../../../store/slices/siteContentSlice';
import type { FAQ } from '../../../types/site-content';
import FAQFormModal from './FAQFormModal';

// RULE: NO form tags - use button click handlers only
// RULE: All API calls through Redux

const FAQsEditor = () => {
  const dispatch = useAppDispatch();
  const { adminFAQs } = useAppSelector((state) => state.siteContent);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  // Load data on mount
  useEffect(() => {
    dispatch(getAdminFAQs());
  }, [dispatch]);

  const handleAdd = () => {
    setEditingFAQ(null);
    setModalOpen(true);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta pregunta?')) {
      dispatch(deleteAdminFAQ(id));
    }
  };

  const handleToggleActive = (faq: FAQ) => {
    dispatch(updateAdminFAQ({ id: faq.id, data: { isActive: !faq.isActive } }));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrders = adminFAQs.map((f, i) => ({
      id: f.id,
      displayOrder: i === index ? index - 1 : i === index - 1 ? index : i,
    }));
    dispatch(reorderAdminFAQs(newOrders));
  };

  const handleMoveDown = (index: number) => {
    if (index === adminFAQs.length - 1) return;
    const newOrders = adminFAQs.map((f, i) => ({
      id: f.id,
      displayOrder: i === index ? index + 1 : i === index + 1 ? index : i,
    }));
    dispatch(reorderAdminFAQs(newOrders));
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingFAQ(null);
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Preguntas Frecuentes (FAQ)</h2>
          <p className="text-sm text-gray-500">
            Las preguntas y respuestas que se muestran en la sección FAQ de la landing page.
          </p>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Agregar Pregunta
        </Button>
      </div>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={60}>Orden</TableCell>
              <TableCell>Pregunta</TableCell>
              <TableCell>Respuesta</TableCell>
              <TableCell width={80} align="center">Activo</TableCell>
              <TableCell width={120} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adminFAQs.map((faq, index) => (
              <TableRow key={faq.id} hover>
                <TableCell>
                  <div className="flex flex-col">
                    <IconButton
                      size="small"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === adminFAQs.length - 1}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{faq.question}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 line-clamp-2">
                    {faq.answer}
                  </span>
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={faq.isActive}
                    onChange={() => handleToggleActive(faq)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleEdit(faq)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(faq.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {adminFAQs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" className="py-8 text-gray-500">
                  No hay preguntas. Hacé clic en "Agregar Pregunta" para crear una.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <FAQFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        faq={editingFAQ}
      />
    </div>
  );
};

export default FAQsEditor;
