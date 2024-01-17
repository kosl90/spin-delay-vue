import { it, beforeEach, afterEach, vi } from "vitest"
import { render, screen } from '@testing-library/vue';
import { watch, defineComponent, h, ref, nextTick } from "vue";
import { useSpinDelay } from '../index';

const TestComponent = defineComponent({
  props: {
    networkTime: {
      type: Number,
      required: true,
    },
    delay: {
      type: Number
    },
    minDuration: {
      type: Number,
    },
  },
  setup(props) {
    const loading = ref(true);
    const showSpinner = useSpinDelay(loading, { delay: props.delay, minDuration: props.minDuration });

    watch(loading, () => {
      console.log("loading is changed to", loading.value);
    }, { immediate: true });

    watch(showSpinner, () => {
      console.log("showSpinner is changed to", showSpinner.value);
    }, { immediate: true });

    setTimeout(() => {
      console.log(`networkTime timer(${props.networkTime}ms) is reached, set loading to false`);
      loading.value = false;
    }, props.networkTime);

    return () => JSON.stringify({ loading: loading.value, showSpinner: showSpinner.value })
  },
});

function setup({ networkTime, delay, minDuration }: { networkTime: number, delay: number, minDuration?: number }) {
  return render(TestComponent, {
    props: {
      networkTime,
      delay,
      minDuration,
    }
  })
}

let currentTime: number = 0;
function advanceTimersTo(time: number) {
  console.log("advanceTimersByTime", time - currentTime);
  vi.advanceTimersByTime(time - currentTime);
  currentTime = time;
}

let _setTimeout = setTimeout;
function assertLoadingAndSpinnerAtTime(loading: boolean, showSpinner: boolean, time: number) {
  return new Promise((resolve, reject) => {
    advanceTimersTo(time);

    // make sure the effect is run
    nextTick(() => {
      try {
        screen.getByText(JSON.stringify({ loading, showSpinner }));
        resolve(void 0)
      } catch (e) {
        reject(e);
      }
    })
  })
}

beforeEach(() => {
  vi.useFakeTimers();
  currentTime = 0;
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

it('does not show spinner when faster than delay', async () => {
  setup({ networkTime: 100, delay: 200 });
  await assertLoadingAndSpinnerAtTime(true, false, 0);
  await assertLoadingAndSpinnerAtTime(false, false, 100);
});

it('shows spinner when slower than delay', async () => {
  // default minDuration is 200ms
  setup({ networkTime: 300, delay: 200 });
  await assertLoadingAndSpinnerAtTime(true, false, 0);

  await assertLoadingAndSpinnerAtTime(true, false, 199);
  await assertLoadingAndSpinnerAtTime(true, true, 200);

  await assertLoadingAndSpinnerAtTime(true, true, 299);
  // the showSpinner should not expired in 300ms
  await assertLoadingAndSpinnerAtTime(false, true, 300);
});

it('shows spinner for minDuration', async () => {
  setup({ networkTime: 300, delay: 200, minDuration: 200 });
  await assertLoadingAndSpinnerAtTime(true, false, 0);

  await assertLoadingAndSpinnerAtTime(true, false, 199);
  await assertLoadingAndSpinnerAtTime(true, true, 200);

  await assertLoadingAndSpinnerAtTime(true, true, 299);
  await assertLoadingAndSpinnerAtTime(false, true, 300);

  await assertLoadingAndSpinnerAtTime(false, true, 399);
  await assertLoadingAndSpinnerAtTime(false, false, 401);
});
