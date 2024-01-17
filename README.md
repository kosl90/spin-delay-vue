# spin-delay-vue

port from [spin-delay](https://github.com/smeijer/spin-delay)

> **DO NOT** test in SSR

## Installation

With npm

```shellsession
npm install --save spin-delay-vue
```

With yarn

```shellsession
yarn add spin-delay-vue
```

With pnpm

```shellsession
pnpm add spin-delay-vue
```

## Example

```vue
<template>
  <Spinner v-if="isLoading" />
  <template v-else>
    ...
  </template>
</template>

<script lang="ts">
import { useSpinDelay } from 'spin-delay-vue'

const { fetching } = useFetch('http://example.com');
const isLoading = useSpinDelay(fetching, { delayInMs: 500, minDurationInMs: 200 });
</script>
````
