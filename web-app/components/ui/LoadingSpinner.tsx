
import { getYearStyles } from '@/utils/gradients';
import { useYear } from '@/contexts/YearContext';

export default function LoadingSpinner({ text }: { text: string }) {
  const { selectedYear } = useYear();
  const yearStyles = getYearStyles(selectedYear);

  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${yearStyles.spinnerBorder} mx-auto`}></div>
        <p className="mt-4 text-gray-600">{text}</p>
      </div>
    </div>
  );
}
