import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function Layout({ children, title, showBackButton = false, onBack }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-center justify-between p-4">
            {showBackButton && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold text-center flex-1">{title}</h1>
            {showBackButton && <div className="w-10"></div>}
          </div>
        </div>
        <div className="p-4 pb-32">
          {children}
        </div>
      </div>
    </div>
  );
}
