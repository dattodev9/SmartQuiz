// ============================================================
// Smart Quiz — Error State Component
// Friendly error display with retry option
// ============================================================

import { useI18n } from '../useI18n';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
      {/* Error Icon */}
      <div className="w-16 h-16 rounded-full bg-error-bg flex items-center justify-center mb-5">
        <span className="text-3xl">😥</span>
      </div>

      {/* Error Title */}
      <h2 className="text-lg font-semibold text-text-primary mb-2">
        {t.errorTitle}
      </h2>

      {/* Error Message */}
      <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-[280px]">
        {message || t.errorDefault}
      </p>

      {/* Retry Button */}
      <button className="btn-primary" onClick={onRetry}>
        🔄 {t.errorRetry}
      </button>
    </div>
  );
}
