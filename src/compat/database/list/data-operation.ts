import { DatabaseReference, DatabaseSnapshot, FirebaseOperation } from '../interfaces';
import { checkOperationCases } from '../utils';

export function createDataOperationMethod(ref: DatabaseReference, operation: string) {
  return function dataOperation<T>(item: FirebaseOperation, value: T) {
    return checkOperationCases(item, {
      stringCase: () => (ref.child(item as string) as any)[operation](value),
      firebaseCase: () => ((item as DatabaseReference) as any)[operation](value),
      snapshotCase: () => ((item as DatabaseSnapshot<T>).ref as any)[operation](value)
    });
  };
}
