import type { HTMLAttributes, ReactNode } from 'react';

export type CardPatternPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-right-soft'
  | 'mid-left'
  | 'resources-rings';
export type CardRingTone = 'light' | 'mid';

const ringStyles: Record<CardRingTone, { stroke: string; opacity: number }> = {
  light: { stroke: '#A0A9AB', opacity: 0.42 },
  mid: { stroke: '#6F787B', opacity: 0.34 },
};

const patternPositions: Record<
  CardPatternPosition,
  { x: string; y: string; sizes: number[] }
> = {
  'top-left': { x: '5%', y: '10%', sizes: [320, 200, 100] },
  'top-right': { x: '102%', y: '4%', sizes: [320, 200, 100] },
  'bottom-right-soft': { x: '100%', y: '50%', sizes: [320, 200, 100] },
  'mid-left': { x: '9%', y: '105%', sizes: [320, 200, 100] },
  'resources-rings': { x: '40%', y: '-5%', sizes: [320, 200, 100] },
};

export function CardCirclePattern({
  position,
  ringTone = 'light',
}: {
  position: CardPatternPosition;
  ringTone?: CardRingTone;
}) {
  const currentPosition = patternPositions[position];
  const currentRing = ringStyles[ringTone];

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {currentPosition.sizes.map((size) => (
        <span
          key={size}
          className="absolute rounded-full"
          style={{
            left: currentPosition.x,
            top: currentPosition.y,
            width: size,
            height: size,
            borderColor: currentRing.stroke,
            borderStyle: 'solid',
            borderWidth: 1,
            opacity: currentRing.opacity,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

type CardElement = 'article' | 'div' | 'section';
type CardVariant = 'surface' | 'subtle' | 'decorativeSoft';

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: CardElement;
  variant?: CardVariant;
  interactive?: boolean;
};

const variantClasses: Record<CardVariant, string> = {
  surface: 'border-theme-border bg-surface text-content',
  subtle: 'border-theme-border bg-surface-alt text-content',
  decorativeSoft:
    'theme-card-decorative-soft border-theme-border bg-surface text-content',
};

export function Card({
  as: Component = 'div',
  variant = 'surface',
  interactive = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <Component
      className={`rounded-[14px] border ${variantClasses[variant]} ${
        interactive
          ? 'theme-card-interactive transition duration-200 hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    />
  );
}

type MetricCardProps = {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  valueClassName?: string;
  className?: string;
};

export function MetricCard({
  label,
  value,
  detail,
  valueClassName = 'text-content-strong',
  className = '',
}: MetricCardProps) {
  return (
    <Card as="article" className={`p-5 ${className}`}>
      <p className="text-sm text-content-muted">{label}</p>
      <p className={`mt-2 font-heading text-3xl font-bold ${valueClassName}`}>
        {value}
      </p>
      {detail && <p className="mt-2 text-sm text-content-muted">{detail}</p>}
    </Card>
  );
}
