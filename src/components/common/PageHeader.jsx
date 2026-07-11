import { cn } from '@/lib/utils';

const PageHeader = ({ title, description, actions, className }) => (
  <div
    className={cn(
      'mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
      className
    )}
  >
    <div className="min-w-0 space-y-1">
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-heading">
        {title}
      </h1>
      {description ? (
        <p className="text-sm text-muted-foreground/90">{description}</p>
      ) : null}
    </div>
    {actions ? (
      <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
    ) : null}
  </div>
);

export default PageHeader;
