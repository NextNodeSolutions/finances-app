import type { IntegerAmount } from '@actual-app/core/shared/util';
import type { CategoryEntity } from '@actual-app/core/types/models';

export type CoverStepperState = {
  /** Categories already covered or skipped, in the order they were handled. */
  handledIds: CategoryEntity['id'][];
  /** A step was skipped or covered only in part. */
  hasLeftOverspending: boolean;
  /** The source of the last cover, offered again on the next step. */
  lastSourceId: string | null;
  /** The current step's form. Nothing is chosen until the user picks. */
  sourceId: string | null;
  typedAmount: IntegerAmount | null;
  error: string | null;
};

export type CoverStepperAction =
  | { type: 'source_chosen'; sourceId: string }
  | { type: 'amount_typed'; amount: IntegerAmount }
  | { type: 'error_shown'; error: string }
  | {
      type: 'covered';
      categoryId: CategoryEntity['id'];
      sourceId: string;
      isPartial: boolean;
    }
  | { type: 'skipped'; categoryId: CategoryEntity['id'] };

export const initialCoverStepperState: CoverStepperState = {
  handledIds: [],
  hasLeftOverspending: false,
  lastSourceId: null,
  sourceId: null,
  typedAmount: null,
  error: null,
};

const emptyStepForm = {
  sourceId: null,
  typedAmount: null,
  error: null,
} satisfies Partial<CoverStepperState>;

export function coverStepperReducer(
  state: CoverStepperState,
  action: CoverStepperAction,
): CoverStepperState {
  switch (action.type) {
    case 'source_chosen':
      // A new source re-derives the capped default amount.
      return {
        ...state,
        sourceId: action.sourceId,
        typedAmount: null,
        error: null,
      };
    case 'amount_typed':
      return { ...state, typedAmount: action.amount, error: null };
    case 'error_shown':
      return { ...state, error: action.error };
    case 'covered':
      return {
        ...state,
        ...emptyStepForm,
        handledIds: [...state.handledIds, action.categoryId],
        hasLeftOverspending: state.hasLeftOverspending || action.isPartial,
        lastSourceId: action.sourceId,
      };
    case 'skipped':
      return {
        ...state,
        ...emptyStepForm,
        handledIds: [...state.handledIds, action.categoryId],
        hasLeftOverspending: true,
      };
    default:
      throw new Error(`Unknown cover action: ${JSON.stringify(action)}`);
  }
}
