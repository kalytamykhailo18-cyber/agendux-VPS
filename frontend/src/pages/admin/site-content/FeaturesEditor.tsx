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
  getAdminFeatures,
  deleteAdminFeature,
  updateAdminFeature,
  reorderAdminFeatures,
} from '../../../store/slices/siteContentSlice';
import type { Feature } from '../../../types/site-content';
import FeatureFormModal from './FeatureFormModal';

// RULE: NO form tags - use button click handlers only
// RULE: All API calls through Redux

const FeaturesEditor = () => {
  const dispatch = useAppDispatch();
  const { adminFeatures } = useAppSelector((state) => state.siteContent);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

  // Load data on mount
  useEffect(() => {
    dispatch(getAdminFeatures());
  }, [dispatch]);

  const handleAdd = () => {
    setEditingFeature(null);
    setModalOpen(true);
  };

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este feature?')) {
      dispatch(deleteAdminFeature(id));
    }
  };

  const handleToggleActive = (feature: Feature) => {
    dispatch(updateAdminFeature({ id: feature.id, data: { isActive: !feature.isActive } }));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrders = adminFeatures.map((f, i) => ({
      id: f.id,
      displayOrder: i === index ? index - 1 : i === index - 1 ? index : i,
    }));
    dispatch(reorderAdminFeatures(newOrders));
  };

  const handleMoveDown = (index: number) => {
    if (index === adminFeatures.length - 1) return;
    const newOrders = adminFeatures.map((f, i) => ({
      id: f.id,
      displayOrder: i === index ? index + 1 : i === index + 1 ? index : i,
    }));
    dispatch(reorderAdminFeatures(newOrders));
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingFeature(null);
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Features / Beneficios</h2>
          <p className="text-sm text-gray-500">
            Las tarjetas de beneficios que se muestran en la landing page.
          </p>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Agregar Feature
        </Button>
      </div>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={60}>Orden</TableCell>
              <TableCell width={100}>Ícono</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell width={80} align="center">Activo</TableCell>
              <TableCell width={120} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adminFeatures.map((feature, index) => (
              <TableRow key={feature.id} hover>
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
                      disabled={index === adminFeatures.length - 1}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {feature.icon}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{feature.title}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 line-clamp-2">
                    {feature.description}
                  </span>
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={feature.isActive}
                    onChange={() => handleToggleActive(feature)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleEdit(feature)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(feature.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {adminFeatures.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" className="py-8 text-gray-500">
                  No hay features. Hacé clic en "Agregar Feature" para crear uno.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <FeatureFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        feature={editingFeature}
      />
    </div>
  );
};

export default FeaturesEditor;
