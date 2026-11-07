import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { CellValue, CellValueText } from '#components/spreadsheet/CellValue';
import type { Binding, SheetFields, SheetNames } from '#spreadsheet';

type PaletteBalanceRowProps<
  SheetName extends SheetNames,
  FieldName extends SheetFields<SheetName>,
> = {
  label: string;
  binding: Binding<SheetName, FieldName>;
};

/** A palette row's label with a balance on the right. */
export function PaletteBalanceRow<
  SheetName extends SheetNames,
  FieldName extends SheetFields<SheetName>,
>({ label, binding }: PaletteBalanceRowProps<SheetName, FieldName>) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
      }}
    >
      <Text>{label}</Text>
      <CellValue binding={binding} type="financial">
        {props => (
          <CellValueText
            {...props}
            style={{
              ...styles.tnum,
              fontSize: 12.5,
              whiteSpace: 'nowrap',
              color: theme.pageTextLight,
            }}
          />
        )}
      </CellValue>
    </View>
  );
}
