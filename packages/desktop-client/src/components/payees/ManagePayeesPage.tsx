import React from 'react';
import { useLocation } from 'react-router';

import type { PayeeEntity } from '@actual-app/core/types/models';

import { ManagePayeesWithData } from './ManagePayeesWithData';
import { useRequestedPayeePanel } from './panels/useRequestedPayeePanel';

export function ManagePayeesPage() {
  const location = useLocation();
  const locationState = location.state;
  const initialSelectedIds =
    locationState && 'selectedPayee' in locationState
      ? [locationState.selectedPayee as PayeeEntity['id']]
      : [];
  useRequestedPayeePanel();

  return <ManagePayeesWithData initialSelectedIds={initialSelectedIds} />;
}
