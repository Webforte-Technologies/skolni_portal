import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import Header from '../../components/layout/Header';
import MaterialDisplay from '../../components/materials/MaterialDisplay';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import apiClient from '../../services/apiClient';

const MaterialViewPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery(
    ['material', id],
    async () => {
      const res = await apiClient.get(`/files/${id}`);
      return res.data;
    },
    { enabled: !!id }
  );

  const file = data?.data;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {isLoading && (
          <Card className="p-6 text-neutral-600 dark:text-neutral-300">Načítání materiálu…</Card>
        )}
        {isError && (
          <Card className="p-6">
            <div className="text-red-600 mb-4">Nepodařilo se načíst materiál.</div>
            <Button variant="secondary" onClick={() => navigate('/materials/my-materials')}>Zpět na materiály</Button>
          </Card>
        )}
        {file && (
          <MaterialDisplay
            material={file}
            onClose={() => navigate(-1)}
          />
        )}
      </main>
    </div>
  );
};

export default MaterialViewPage;


