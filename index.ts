import { ref, toRef, computed, watch, onBeforeUnmount } from "vue";
import type { Ref, MaybeRefOrGetter } from "vue";

export type SpinDelayOptions = {
  delayInMs?: MaybeRefOrGetter<number>;
  minDurationInMs?: MaybeRefOrGetter<number>;
}

export const defaultOptions: SpinDelayOptions = {
  delayInMs: 500,
  minDurationInMs: 200,
};

type State = 'IDLE' | 'DELAY' | 'DISPLAY' | 'EXPIRE';

export function useSpinDelay(loading: Ref<boolean>, { delayInMs: _delay = 500, minDurationInMs: _minDuration = 200 }: SpinDelayOptions = defaultOptions) {
  const delayInMs = toRef(_delay);
  const minDurationInMs = toRef(_minDuration);

  let timeout: number | undefined = undefined;

  const state = ref<State>('IDLE');
  watch([loading, state, delayInMs, minDurationInMs], () => {
    if (loading.value && state.value === 'IDLE') {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        if (!loading.value) {
          state.value = 'IDLE';
          return;
        }

        timeout = setTimeout(() => {
          state.value = 'EXPIRE';
        }, minDurationInMs.value);

        state.value = 'DISPLAY';
      }, delayInMs.value);

      state.value = 'DELAY';
    }

    if (!loading.value && state.value !== 'DISPLAY') {
      clearTimeout(timeout);
      state.value = 'IDLE';
    }
  }, { immediate: true })

  onBeforeUnmount(() => {
    clearTimeout(timeout);
  })

  return computed(() => {
    const res = state.value === 'DISPLAY' || state.value === 'EXPIRE';
    return res;
  });
}
