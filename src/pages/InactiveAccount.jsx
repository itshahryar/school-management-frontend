import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, Phone, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';

/** Sample owner contact details — replace with real school owner info later. */
const OWNER_CONTACT = {
  phone: '+1 (555) 010-2000',
  email: 'owner@school.example.com',
};

const InactiveAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch {
      toast.error('Logout failed');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-700">
          <ShieldOff className="size-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-heading">
            Account inactive
          </h1>
          <p className="text-sm text-muted-foreground">
            You are currently set to inactive. The dashboard and management tools
            are unavailable until the owner reactivates your account.
          </p>
        </div>

        <div className="space-y-3 rounded-xl border bg-muted/40 p-4 text-left text-sm">
          <p className="font-medium text-heading">Contact the owner</p>
          <a
            href={`tel:${OWNER_CONTACT.phone.replace(/[^\d+]/g, '')}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-heading"
          >
            <Phone className="size-4 shrink-0" />
            {OWNER_CONTACT.phone}
          </a>
          <a
            href={`mailto:${OWNER_CONTACT.email}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-heading"
          >
            <Mail className="size-4 shrink-0" />
            {OWNER_CONTACT.email}
          </a>
        </div>

        <Button type="button" className="w-full" onClick={handleLogout}>
          <LogOut />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default InactiveAccount;
