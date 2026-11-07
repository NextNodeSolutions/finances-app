import { MobileBackButton } from '#components/mobile/MobileBackButton';

import { useReportsBack } from './useReportsBack';

/** The mobile header's back button on a report page. */
export function ReportMobileBackButton() {
  const goBack = useReportsBack();

  return <MobileBackButton onPress={goBack} />;
}
