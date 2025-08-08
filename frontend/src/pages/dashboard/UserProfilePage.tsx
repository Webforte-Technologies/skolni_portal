import React from 'react';
import EditProfileModal from '../../components/dashboard/EditProfileModal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100">My profile</h1>
      <Card title="Account">
        <div className="space-y-2 text-sm">
          <p><span className="text-neutral-500">Name:</span> {user.first_name} {user.last_name}</p>
          <p><span className="text-neutral-500">Email:</span> {user.email}</p>
          <p><span className="text-neutral-500">Role:</span> {user.role}</p>
          <p><span className="text-neutral-500">Credits:</span> {user.credits_balance}</p>
        </div>
        <div className="mt-4">
          <Button onClick={() => setOpen(true)}>Edit profile</Button>
        </div>
      </Card>
      <EditProfileModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default UserProfilePage;



