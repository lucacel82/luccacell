import { useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useClaimOrphanData = (user: User | null) => {
  const claimed = useRef(false);

  useEffect(() => {
    if (!user || claimed.current) return;
    claimed.current = true;

    const claim = async () => {
      await Promise.all([
        supabase.from('vendas').update({ user_id: user.id }).is('user_id', null),
        supabase.from('produtos').update({ user_id: user.id } as any).is('user_id', null),
      ]);
      console.log('Dados órfãos reivindicados para', user.id);
    };

    claim();
  }, [user]);
};
