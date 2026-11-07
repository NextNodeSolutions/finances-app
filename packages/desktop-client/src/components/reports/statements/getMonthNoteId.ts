/** The id of a month's budget note, as the budget summary's notes button uses it. */
export function getMonthNoteId(month: string): string {
  return `budget-${month}`;
}
