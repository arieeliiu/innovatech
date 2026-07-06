import type { HTMLAttributes, ReactNode } from 'react';

export type CardPatternPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-right-soft'
  | 'mid-left'
  | 'analytics-projects-total'
  | 'analytics-projects-completed'
  | 'analytics-resources-total'
  | 'analytics-resources-available'
  | 'analytics-resources-unavailable'
  | 'analytics-tasks-total'
  | 'analytics-tasks-in-progress'
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
  'analytics-projects-total': {
    x: '-3%',
    y: '-5%',
    sizes: [320, 200, 100],
  },
  'analytics-projects-completed': {
    x: '105%',
    y: '110%',
    sizes: [320, 200, 100],
  },
  'analytics-resources-total': {
    x: '10%',
    y: '50%',
    sizes: [320, 200, 100],
  },
  'analytics-resources-available': {
    x: '100%',
    y: '50%',
    sizes: [320, 200, 100],
  },
  'analytics-resources-unavailable': {
    x: '10%',
    y: '50%',
    sizes: [320, 200, 100],
  },
  'analytics-tasks-total': {
    x: '5%',
    y: '10%',
    sizes: [320, 200, 100],
  },
  'analytics-tasks-in-progress': {
    x: '90%',
    y: '105%',
    sizes: [320, 200, 100],
  },
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
type CardVariant =
  | 'surface'
  | 'subtle'
  | 'decorativeSoft'
  | 'decorativeStrong';

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
  decorativeStrong:
    'theme-card-decorative-strong border-theme-border bg-surface text-content',
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
  icon?: ReactNode;
  variant?: CardVariant;
  patternPosition?: CardPatternPosition;
  ringTone?: CardRingTone;
  valueClassName?: string;
  className?: string;
};

export function MetricCard({
  label,
  value,
  detail,
  icon,
  variant = 'surface',
  patternPosition,
  ringTone = 'light',
  valueClassName = 'text-content-strong',
  className = '',
}: MetricCardProps) {
  return (
    <Card
      as="article"
      variant={variant}
      interactive
      className={`relative isolate min-h-[120px] overflow-hidden px-[26px] py-6 ${className}`}
    >
      {patternPosition && (
        <CardCirclePattern position={patternPosition} ringTone={ringTone} />
      )}

      <div className="relative z-10 flex items-start justify-between gap-[18px]">
        <div>
          <p className="text-[15px] font-medium leading-[1.3] text-content-strong">
            {label}
          </p>
          <p
            className={`mt-4 font-heading text-[30px] font-bold leading-[0.95] ${valueClassName}`}
          >
            {value}
          </p>
          {detail && (
            <p className="mt-2 text-sm text-content-muted">{detail}</p>
          )}
        </div>

        {icon && (
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-feature-icon-border bg-feature-icon-background text-feature-icon shadow-sm">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
