import { useTheme } from "./useTheme";

export default function useHomeTheme() {
  return useTheme().isDark;
}
