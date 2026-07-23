import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createUser } from '@/store/slices/authSlice';
import { usersApi } from '@/features/users/api/usersApi';
import UserSchoolAssignments from '@/features/schools/components/UserSchoolAssignments';
import { createUserSchema } from '../schemas/authSchemas';
import { ASSIGNABLE_ROLES, ROLES } from '@/constants/roles';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  role: ASSIGNABLE_ROLES[0],
  password: '',
  confirmPassword: '',
  primaryPhone: '',
  secondaryPhone: '',
  primaryPhoneVerified: false,
  nationalId: '',
};

const CreateUserForm = ({ open, onOpenChange }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schoolAssignments, setSchoolAssignments] = useState([]);

  const canCreate = currentUser?.role === ROLES.OWNER;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
      setSchoolAssignments([]);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsSubmitting(false);
    }
  }, [open, reset]);

  const handleOpenChange = (nextOpen) => {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const userData = {
        ...data,
        schoolAssignments: schoolAssignments.map((item) => ({
          schoolId: item.schoolId,
          designation: item.designation?.trim() || null,
        })),
      };
      delete userData.confirmPassword;
      await dispatch(createUser(userData)).unwrap();
      dispatch(usersApi.util.invalidateTags([{ type: 'Users', id: 'LIST' }]));
      toast.success(`User created successfully as ${data.role}`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
      >
        {canCreate ? (
          <>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a user account, assign a role, and link them to one or more schools.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="create-first-name">First Name</Label>
                  <Input
                    id="create-first-name"
                    placeholder="John"
                    aria-invalid={!!errors.firstName}
                    {...register('firstName')}
                  />
                  {errors.firstName ? (
                    <p className="text-xs text-destructive">
                      {errors.firstName.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-last-name">Last Name</Label>
                  <Input
                    id="create-last-name"
                    placeholder="Doe"
                    aria-invalid={!!errors.lastName}
                    {...register('lastName')}
                  />
                  {errors.lastName ? (
                    <p className="text-xs text-destructive">
                      {errors.lastName.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-email">Email Address</Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email ? (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-role">Role</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="create-role"
                        className="w-full"
                        aria-invalid={!!errors.role}
                      >
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNABLE_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role ? (
                  <p className="text-xs text-destructive">{errors.role.message}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="create-primary-phone">Primary Phone</Label>
                  <Input
                    id="create-primary-phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    {...register('primaryPhone')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-secondary-phone">Secondary Phone</Label>
                  <Input
                    id="create-secondary-phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    {...register('secondaryPhone')}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <Label htmlFor="create-phone-verified">
                    Primary phone verified
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Mark when the primary number has been checked
                  </p>
                </div>
                <Controller
                  name="primaryPhoneVerified"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="create-phone-verified"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-national-id">CNIC / National ID</Label>
                <Input
                  id="create-national-id"
                  placeholder="e.g. 35202-1234567-1"
                  {...register('nationalId')}
                />
              </div>

              <div className="rounded-lg border p-3">
                <UserSchoolAssignments
                  assignments={schoolAssignments}
                  onChange={setSchoolAssignments}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-password">Password</Label>
                <div className="relative">
                  <Input
                    id="create-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pr-9"
                    aria-invalid={!!errors.password}
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-1 -translate-y-1/2"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {errors.password ? (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="create-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pr-9"
                    aria-invalid={!!errors.confirmPassword}
                    {...register('confirmPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-1 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {errors.confirmPassword ? (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Access Denied</DialogTitle>
              <DialogDescription>
                Only the owner can create users with specific roles.
              </DialogDescription>
            </DialogHeader>
            <Alert>
              <AlertTitle>Insufficient permissions</AlertTitle>
              <AlertDescription>
                Ask an owner to create accounts or update your role.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end pt-2">
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserForm;
