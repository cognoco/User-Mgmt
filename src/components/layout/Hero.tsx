import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HeroProps {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode; // For custom CTAs/buttons
  className?: string;
}

export function Hero({ title, description, children, className }: HeroProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="container relative z-10 mx-auto px-4 py-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {title ?? (<>
              Build Better Apps{' '}
              <span className="text-primary">Faster</span>
            </>)}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {description ?? 'A complete solution for building modern web applications. Start with our production-ready components and focus on what matters most - your business logic.'}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {children}
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
    </div>
  );
}