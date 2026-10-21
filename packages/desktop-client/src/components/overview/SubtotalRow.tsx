import { theme } from '@actual-app/components/theme';

import { Amount } from './Amount';
import type { SubtotalRow as SubtotalRowModel } from './balanceSheetRows';

type SubtotalRowProps = {
  row: SubtotalRowModel;
};

/** A side (On budget, Off budget, Closed) or account group with its total. */
export function SubtotalRow({ row }: SubtotalRowProps) {
  const { level, label, balance, change } = row;
  const isSide = level === 'side';
  const figureStyle = { fontWeight: isSide ? 500 : 400 };

  return (
    <tr>
      <th
        scope="rowgroup"
        style={{
          paddingLeft: isSide ? 20 : 24,
          fontSize: isSide ? 13 : 12.5,
          fontWeight: isSide ? 600 : 500,
          color: isSide ? theme.pageTextDark : theme.pageTextLight,
        }}
      >
        {label}
      </th>
      <td>
        <Amount value={balance} tone="balance" style={figureStyle} />
      </td>
      <td>
        <Amount
          value={change === 0 ? null : change}
          tone="change"
          style={figureStyle}
        />
      </td>
    </tr>
  );
}
