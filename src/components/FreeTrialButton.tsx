
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FreeTrialModal } from './FreeTrialModal';

export const FreeTrialButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2"
      >
        Teste Grátis
      </Button>
      
      <FreeTrialModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
