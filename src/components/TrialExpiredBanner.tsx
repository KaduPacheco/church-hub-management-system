
import { AlertTriangle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface TrialExpiredBannerProps {
  isExpired: boolean;
  onUpgrade?: () => void;
}

export const TrialExpiredBanner = ({ isExpired, onUpgrade }: TrialExpiredBannerProps) => {
  if (!isExpired) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-800">
          Seu período de teste expirou. Faça upgrade para continuar usando o sistema.
        </span>
        {onUpgrade && (
          <Button 
            onClick={onUpgrade}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 ml-4"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Fazer Upgrade
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
