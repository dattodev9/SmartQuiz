// ============================================================
// Smart Quiz — Error State Component
// Friendly error display with retry option
// ============================================================

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  const defaultMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
      {/* Error Icon */}
      <div className="w-16 h-16 rounded-full bg-error-bg flex items-center justify-center mb-5">
        <span className="text-3xl">😥</span>
      </div>

      {/* Error Title */}
      <h2 className="text-lg font-semibold text-text-primary mb-2">
        Oops!
      </h2>

      {/* Error Message */}
      <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-[280px]">
        {message || defaultMessage}
      </p>

      {/* Tips */}
      <div className="w-full max-w-[280px] px-4 py-3 rounded-lg bg-bg-glass border border-border mb-6">
        <p className="text-xs font-semibold text-text-secondary mb-2">💡 Mẹo:</p>
        <ul className="space-y-1.5 text-xs text-text-muted">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 mt-0.5">•</span>
            <span>Chọn đoạn văn bản dài hơn (ít nhất 100 ký tự)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 mt-0.5">•</span>
            <span>Tránh chọn đoạn chỉ chứa số hoặc ký tự đặc biệt</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 mt-0.5">•</span>
            <span>Kiểm tra kết nối internet</span>
          </li>
        </ul>
      </div>

      {/* Retry Button */}
      <button className="btn-primary" onClick={onRetry}>
        🔄 Thử lại
      </button>
    </div>
  );
}
