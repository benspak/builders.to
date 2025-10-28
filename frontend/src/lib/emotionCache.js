import createCache from '@emotion/cache';

export function createEmotionCache() {
  return createCache({
    key: 'chakra-ui',
    prepend: true,
  });
}

export const emotionCache = createEmotionCache();
