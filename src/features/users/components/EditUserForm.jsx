import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUpdateUserMutation } from '@/features/users/api/usersApi';
import { updateUserSchema } from '@/features/auth/schemas/authSchemas';
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
import { Switch } from '@/components/ui/switch';

const EditUserForm = ({ open, onOpenChange, userItem = null }) => {
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isOwnerAccount = userItem?.role === ROLES.OWNER;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: ASSIGNABLE_ROLES[0],
      isActive: true,
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!open || !userItem) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        role: ASSIGNABLE_ROLES[0],
        isActive: true,
        password: '',
        confirmPassword: '',
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
      return;
    }

    reset({
      firstName: userItem.firstName || '',
      lastName: userItem.lastName || '',
      email: userItem.email || '',
      role:
        userItem.role === ROLES.OWNER
          ? ASSIGNABLE_ROLES[0]
          : userItem.role || ASSIGNABLE_ROLES[0],
      isActive: userItem.isActive ?? true,
      password: '',
      confirmPassword: '',
    });
  }, [open, userItem, reset]);

  const handleOpenChange = (nextOpen) => {
    if (isLoading) return;
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values) => {
    if (!userItem?.id) return;

    const payload = {
      id: userItem.id,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      isActive: isOwnerAccount ? true : values.isActive,
    };

    if (!isOwnerAccount) {
      payload.role = values.role;
    }

    if (values.password?.trim()) {
      payload.password = values.password.trim();
      payload.confirmPassword = values.confirmPassword.trim();
    }

    try {
      await updateUser(payload).unwrap();
      toast.success('User updated successfully');
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update user');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-md"
        onPointerDownOutside={(event) => {
          if (isLoading) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isLoading) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
          <DialogDescription>
            Edit account details
            {isOwnerAccount
              ? '. Owner accounts cannot be set to inactive.'
              : '.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-first-name">First Name</Label>
              <Input
                id="edit-first-name"
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
              <Label htmlFor="edit-last-name">Last Name</Label>
              <Input
                id="edit-last-name"
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
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          {!isOwnerAccount ? (
            <div className="space-y-2">
              <Label>Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNABLE_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0) + role.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          ) : (
            <div className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
              Role: Owner
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <Label htmlFor="edit-active">Active account</Label>
              {isOwnerAccount ? (
                <p className="text-xs text-muted-foreground">
                  Owner cannot be set to inactive
                </p>
              ) : null}
            </div>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  id="edit-active"
                  checked={field.value}
                  disabled={isOwnerAccount || isLoading}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-password">New password (optional)</Label>
            <div className="relative">
              <Input
                id="edit-password"
                type={showPassword ? 'text' : 'password'}
                className="pr-10"
                placeholder="Leave blank to keep current"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-1/2 right-1 -translate-y-1/2"
                onClick={() => setShowPassword((prev) => !prev)}
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
            <Label htmlFor="edit-confirm-password">Confirm new password</Label>
            <div className="relative">
              <Input
                id="edit-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                className="pr-10"
                aria-invalid={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-1/2 right-1 -translate-y-1/2"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
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

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserForm;
