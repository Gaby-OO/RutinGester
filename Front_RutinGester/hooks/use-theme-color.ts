/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useThemeMode } from '@/contexts/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // Prefer user-selected theme mode if available
  let theme: 'light' | 'dark' = 'light';
  try {
    const { effectiveScheme } = useThemeMode();
    theme = effectiveScheme;
  } catch {
    // Fallback to system color scheme if context not mounted yet
    const system = useColorScheme() ?? 'light';
    theme = system === 'dark' ? 'dark' : 'light';
  }
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
