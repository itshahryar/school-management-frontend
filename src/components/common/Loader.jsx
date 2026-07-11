import { FiLoader } from 'react-icons/fi';

const Loader = ({ size = 'md', text, className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-10 w-10',
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <FiLoader className={`${sizeClasses[size]} animate-spin`} style={{ color: 'var(--primary)' }} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
};

export default Loader;
