import React from 'react';
import { Trans } from 'react-i18next';

import { Select } from '@actual-app/components/select';

import { OptionField } from './OptionField';
import { dateFormats } from './utils';
import type { DateFormat, FieldMapping, ImportTransaction } from './utils';

const SELECT_WIDTH = 140;

type DateFormatSelectProps = {
  transactions: ImportTransaction[];
  fieldMappings?: FieldMapping;
  parseDateFormat?: DateFormat;
  onChange: (newValue: string) => void;
};

export function DateFormatSelect({
  transactions,
  fieldMappings,
  parseDateFormat,
  onChange,
}: DateFormatSelectProps) {
  // We don't actually care about the delimiter, but we try to render
  // it based on the data we have so far. Look in a transaction and
  // try to figure out what delimiter the date is using, and default
  // to space if we can't figure it out.
  let delimiter = '-';
  if (transactions.length > 0 && fieldMappings && fieldMappings.date != null) {
    const date = transactions[0][fieldMappings.date];
    const m = date && String(date).match(/[/.,\-/\\]/);
    delimiter = m ? m[0] : ' ';
  }

  return (
    <OptionField
      htmlFor="date-format-select"
      label={<Trans>Date format</Trans>}
    >
      <Select
        id="date-format-select"
        options={dateFormats.map(f => [
          f.format,
          f.label.replace(/ /g, delimiter),
        ])}
        value={parseDateFormat || ''}
        onChange={onChange}
        style={{ width: SELECT_WIDTH }}
      />
    </OptionField>
  );
}
