import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import { api } from '../../services/apiClient';

interface TeacherForm {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

const SchoolAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [school, setSchool] = useState<any | null>(null);
  const [schoolForm, setSchoolForm] = useState<{ name?: string; address?: string; city?: string; postal_code?: string; contact_email?: string; contact_phone?: string; logo_url?: string }>({});
  const [form, setForm] = useState<TeacherForm>({ email: '', first_name: '', last_name: '', password: '' });

  const loadTeachers = async () => {
    if (!user?.school_id) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/schools/${user.school_id}/teachers`);
      if (res.data.success) setTeachers(res.data.data);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSchool = async () => {
    if (!user?.school_id) return;
    const res = await api.get(`/schools/${user.school_id}`);
    if (res.data.success) {
      setSchool(res.data.data);
      setSchoolForm({
        name: res.data.data.name,
        address: res.data.data.address || '',
        city: res.data.data.city || '',
        postal_code: res.data.data.postal_code || '',
        contact_email: res.data.data.contact_email || '',
        contact_phone: res.data.data.contact_phone || '',
        logo_url: res.data.data.logo_url || ''
      });
    }
  };

  useEffect(() => { loadTeachers(); loadSchool(); }, []);

  const addTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.school_id) return;
    setIsLoading(true);
    try {
      await api.post(`/schools/${user.school_id}/teachers`, form);
      setForm({ email: '', first_name: '', last_name: '', password: '' });
      await loadTeachers();
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateTeacher = async (id: string) => {
    if (!user?.school_id) return;
    setIsLoading(true);
    try {
      await api.delete(`/schools/${user.school_id}/teachers/${id}`);
      await loadTeachers();
    } finally {
      setIsLoading(false);
    }
  };

  const saveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.school_id) return;
    setIsLoading(true);
    try {
      const res = await api.put(`/schools/${user.school_id}`, schoolForm);
      if (res.data.success) {
        setSchool(res.data.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100">School management</h1>
      <Card title="School profile">
        <form onSubmit={saveSchool} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InputField label="Name" required value={schoolForm.name || ''} onChange={e=>setSchoolForm({...schoolForm, name: e.target.value})} />
          <InputField label="City" value={schoolForm.city || ''} onChange={e=>setSchoolForm({...schoolForm, city: e.target.value})} />
          <InputField label="Postal code" value={schoolForm.postal_code || ''} onChange={e=>setSchoolForm({...schoolForm, postal_code: e.target.value})} />
          <InputField label="Address" className="sm:col-span-2" value={schoolForm.address || ''} onChange={e=>setSchoolForm({...schoolForm, address: e.target.value})} />
          <InputField label="Contact email" value={schoolForm.contact_email || ''} onChange={e=>setSchoolForm({...schoolForm, contact_email: e.target.value})} />
          <InputField label="Contact phone" value={schoolForm.contact_phone || ''} onChange={e=>setSchoolForm({...schoolForm, contact_phone: e.target.value})} />
          <InputField label="Logo URL" className="sm:col-span-2" value={schoolForm.logo_url || ''} onChange={e=>setSchoolForm({...schoolForm, logo_url: e.target.value})} />
          <div className="sm:col-span-3 flex justify-end">
            <Button type="submit" disabled={isLoading}>Save</Button>
          </div>
        </form>
      </Card>
      <Card title="Teachers">
        <div className="space-y-4">
          <form onSubmit={addTeacher} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <InputField label="Email" required value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
            <InputField label="First name" required value={form.first_name} onChange={e=>setForm({...form, first_name: e.target.value})} />
            <InputField label="Last name" required value={form.last_name} onChange={e=>setForm({...form, last_name: e.target.value})} />
            <InputField label="Temp password" required type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
            <div className="flex items-end">
              <Button type="submit" disabled={isLoading}>Add teacher</Button>
            </div>
          </form>
          <div className="border-t border-gray-200 dark:border-neutral-800 pt-4">
            {isLoading && <p className="text-sm text-neutral-500">Loading…</p>}
            <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
              {teachers.map(t => (
                <li key={t.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-neutral-100">{t.first_name} {t.last_name}</p>
                    <p className="text-sm text-neutral-500">{t.email} • {t.role}</p>
                  </div>
                  <div>
                    {t.is_active ? (
                      <Button variant="secondary" onClick={()=>deactivateTeacher(t.id)} disabled={isLoading}>Deactivate</Button>
                    ) : (
                      <span className="text-xs text-neutral-500">Deactivated</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SchoolAdminPage;



