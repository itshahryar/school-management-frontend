import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-10',
};

const Loader = ({ size = 'md', text, className = '' }) => (
  <div className={cn('flex items-center justify-center gap-2', className)}>
    <Loader2
      className={cn(sizeClasses[size], 'animate-spin text-primary')}
      aria-hidden
    />
    {text ? <span className="text-sm text-muted-foreground">{text}</span> : null}
    <span className="sr-only">{text || 'Loading'}</span>
  </div>
);

export default Loader;
