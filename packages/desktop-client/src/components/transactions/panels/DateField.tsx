import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { DateSelect } from '#components/select/DateSelect';
import { useDateFormat } from '#hooks/useDateFormat';

import { PanelField } from './PanelField';

type DateFieldProps = {
  /** `YYYY-MM-DD`. */
  date: string;
  onChange: (date: string) => void;
  isDisabled?: boolean;
};

export function DateField({ date, onChange, isDisabled }: DateFieldProps) {
  const { t } = useTranslation();
  const id = useId();
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';

  return (
    <PanelField label={t('Date')} htmlFor={id}>
      <DateSelect
        id={id}
        value={date}
        dateFormat={dateFormat}
        inputProps={{ disabled: isDisabled }}
        // Typed dates count right away, so Cmd+Enter saves them.
        onUpdate={onChange}
        onSelect={onChange}
      />
    </PanelField>
  );
}
