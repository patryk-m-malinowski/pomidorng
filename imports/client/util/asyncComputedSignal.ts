import { Signal, effect, signal, untracked } from "@angular/core";

export interface PromiseState<T> {
  /** The value returned by the async function, if it has resolved successfully. */
  value?: T;
  /** True if the async function is still pending. */
  pending: boolean;
  /** The error the async function rejected with. */
  error?: unknown;
}

/**
 * Helper function to create a signal that maps a source signal to another value using an asynchronous function.
 *
 * @param source The signal that provides the input value to the mapper function.
 * @param mapper The asynchronous function that maps the input value to the desired output.
 * @returns A read-only signal representing the state of the asynchronous operation.
 *
 * When the source signal changes, the state is set to `{ value: undefined, pending: true }` until the new promise resolves or rejects.
 *
 */
export function asyncComputedSignal<K, T>(
  source: () => K,
  mapper: (key: K) => Promise<T>,
): Signal<PromiseState<T>> {
  const state = signal<PromiseState<T>>({ pending: true });
  effect(() => {
    const currentKey = source();
    state.set({ pending: true });
    untracked(() => {
      const isCurrent = () => currentKey === source();
      mapper(currentKey).then(
        (value) => isCurrent() && state.set({ value, pending: false }),
        (error) => isCurrent() && state.set({ error, pending: false }),
      );
    });
  });
  return state.asReadonly();
}
