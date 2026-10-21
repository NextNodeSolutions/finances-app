import type { PayeeEntity } from '@actual-app/core/types/models';

/** An existing payee named `name`, ignoring case; transfer payees excluded. */
export function findPayeeByName(
  payees: readonly PayeeEntity[],
  name: string,
): PayeeEntity | undefined {
  const wanted = name.trim().toLocaleLowerCase();
  if (wanted === '') {
    return undefined;
  }
  return payees.find(
    payee =>
      !payee.transfer_acct && payee.name.trim().toLocaleLowerCase() === wanted,
  );
}
