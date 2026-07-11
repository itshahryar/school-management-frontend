import { cn } from '@/lib/utils';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center px-6 py-16 text-center',
      className
    )}
  >
    {Icon ? (
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </div>
    ) : null}
    <h3 className="font-heading text-base font-medium text-heading">{title}</h3>
    {description ? (
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
    ) : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export default EmptyState;
