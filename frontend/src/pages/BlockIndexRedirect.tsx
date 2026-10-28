import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';
import { useQuery } from '@tanstack/react-query';

export function BlockIndexRedirect() {
  const { blockHeight = '' } = useParams();
  const navigate = useNavigate();

  const { data, error } = useQuery({
    queryKey: ['block-index', blockHeight],
    queryFn: () => api.blockIndex(blockHeight),
  });

  useEffect(() => {
    if (data?.blockHash) {
      void navigate(`/block/${data.blockHash}`, { replace: true });
    }
  }, [data, navigate]);

  if (error) return <ErrorPanel title="Block height not found" detail={blockHeight} />;
  return <LoadingPanel label={`Resolving block #${blockHeight}…`} />;
}
