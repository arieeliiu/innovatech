type ProgressBarProps = {
  value: number;
  label?: string;
  size?: 'sm' | 'md';
};

export function ProgressBar({
  value,
  label = 'Avance',
  size = 'sm',
}: ProgressBarProps) {
  const progress = Math.min(Math.max(value ?? 0, 0), 100);

  const barHeight = size === 'md' ? 'h-3' : 'h-2';

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm text-content-muted">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>

      <div className={`${barHeight} rounded-full bg-surface-alt`}>
        <div
          className={`${barHeight} rounded-full bg-primary`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
