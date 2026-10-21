import { useEffect, useState } from 'react';

import { useSpreadsheet } from '#hooks/useSpreadsheet';

export type SheetCellRequest = {
  /** Where the value lands in the result. */
  key: string;
  sheetName: string;
  /** The cell name within the sheet, e.g. `leftover-<categoryId>`. */
  name: string;
};

/**
 * Binds many spreadsheet cells at once (one per category or month) and
 * returns their numeric values by key (flags read as 1 or 0, anything else
 * as 0). A key is absent until its cell has reported, so `key in values`
 * tells a loaded zero from a pending cell. Cells unbind when the requests
 * change or the caller unmounts, so the bindings live only while needed.
 */
export function useSheetValues(
  requests: readonly SheetCellRequest[],
): Readonly<Record<string, number>> {
  const spreadsheet = useSpreadsheet();
  const [values, setValues] = useState<Record<string, number>>({});
  // Re-bind only when the set of cells changes, not on every new array.
  const signature = requests
    .map(request => `${request.key}=${request.sheetName}!${request.name}`)
    .join('|');

  useEffect(() => {
    const unbinds = parseSignature(signature).map(request =>
      spreadsheet.bind(request.sheetName, request.name, result => {
        const value = toNumber(result.value);
        setValues(previous =>
          previous[request.key] === value
            ? previous
            : { ...previous, [request.key]: value },
        );
      }),
    );
    return () => unbinds.forEach(unbind => unbind());
  }, [spreadsheet, signature]);

  return values;
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  return value === true ? 1 : 0;
}

function parseSignature(signature: string): SheetCellRequest[] {
  if (signature === '') {
    return [];
  }
  return signature.split('|').map(entry => {
    const separator = entry.indexOf('=');
    const target = entry.slice(separator + 1);
    const bang = target.indexOf('!');
    return {
      key: entry.slice(0, separator),
      sheetName: target.slice(0, bang),
      name: target.slice(bang + 1),
    };
  });
}
