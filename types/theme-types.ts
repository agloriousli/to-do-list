export type ThemeMode = "light" | "dark"

export type ThemeName = "black-white" | "lavender-mist" | "mint-sorbet" | "peach-bloom" | "sky-fade" | "citrus-haze"

export interface ThemeColors {
  background: string
  foreground: string
  accent: string
  card: string
  taskSubcolors: string[]
}

export interface Theme {
  name: ThemeName
  displayName: string
  light: ThemeColors
  dark: ThemeColors
}

export interface AppTheme {
  mode: ThemeMode
  theme: ThemeName
  font: string
}

export const THEMES: Theme[] = [
  {
    name: "black-white",
    displayName: "Black & White",
    light: {
      background: "#FFFFFF",
      foreground: "#000000",
      accent: "#666666",
      card: "#F8F8F8",
      taskSubcolors: ["#E5E5E5", "#D0D0D0", "#B8B8B8"],
    },
    dark: {
      background: "#000000",
      foreground: "#FFFFFF",
      accent: "#CCCCCC",
      card: "#1A1A1A",
      taskSubcolors: ["#333333", "#4D4D4D", "#666666"],
    },
  },
  {
    name: "lavender-mist",
    displayName: "Lavender Mist",
    light: {
      background: "#F8F5FF",
      foreground: "#2B2B2B",
      accent: "#C084FC",
      card: "#FFFFFF",
      taskSubcolors: ["#E9D5FF", "#F3E8FF", "#EDE9FE"],
    },
    dark: {
      background: "#1E1B2E",
      foreground: "#F3E8FF",
      accent: "#A78BFA",
      card: "#2A243F",
      taskSubcolors: ["#5B21B6", "#6D28D9", "#7C3AED"],
    },
  },
  {
    name: "mint-sorbet",
    displayName: "Mint Sorbet",
    light: {
      background: "#F0FFF4",
      foreground: "#1F2937",
      accent: "#6EE7B7",
      card: "#FFFFFF",
      taskSubcolors: ["#D1FAE5", "#A7F3D0", "#CCFBF1"],
    },
    dark: {
      background: "#102520",
      foreground: "#D1FAE5",
      accent: "#34D399",
      card: "#1B2C2A",
      taskSubcolors: ["#065F46", "#10B981", "#059669"],
    },
  },
  {
    name: "peach-bloom",
    displayName: "Peach Bloom",
    light: {
      background: "#FFF7ED",
      foreground: "#2E2A26",
      accent: "#FDA4AF",
      card: "#FFFFFF",
      taskSubcolors: ["#FFE4E6", "#FECDD3", "#FBCFE8"],
    },
    dark: {
      background: "#2A1E1E",
      foreground: "#FFE4E6",
      accent: "#FB7185",
      card: "#3B2D2E",
      taskSubcolors: ["#9F1239", "#E11D48", "#F43F5E"],
    },
  },
  {
    name: "sky-fade",
    displayName: "Sky Fade",
    light: {
      background: "#F0F9FF",
      foreground: "#1E293B",
      accent: "#60A5FA",
      card: "#FFFFFF",
      taskSubcolors: ["#DBEAFE", "#BFDBFE", "#E0F2FE"],
    },
    dark: {
      background: "#0F172A",
      foreground: "#DBEAFE",
      accent: "#3B82F6",
      card: "#1E293B",
      taskSubcolors: ["#1D4ED8", "#2563EB", "#3B82F6"],
    },
  },
  {
    name: "citrus-haze",
    displayName: "Citrus Haze",
    light: {
      background: "#FFFEF0",
      foreground: "#3D3A1C",
      accent: "#FACC15",
      card: "#FFFFFF",
      taskSubcolors: ["#FEF9C3", "#FDE68A", "#FCD34D"],
    },
    dark: {
      background: "#2A2410",
      foreground: "#FEF9C3",
      accent: "#EAB308",
      card: "#3A3214",
      taskSubcolors: ["#CA8A04", "#D97706", "#F59E0B"],
    },
  },
]

export function getThemeColors(themeName: ThemeName, mode: ThemeMode): ThemeColors {
  const theme = THEMES.find(t => t.name === themeName)
  if (!theme) {
    return THEMES[0].light // fallback to black-white
  }
  return mode === "light" ? theme.light : theme.dark
}

export const FONT_OPTIONS = [
  { name: "Inter", value: "Inter", displayName: "Inter (Modern)" },
  { name: "Roboto", value: "Roboto", displayName: "Roboto (Clean)" },
  { name: "Open Sans", value: "Open Sans", displayName: "Open Sans (Friendly)" },
  { name: "Poppins", value: "Poppins", displayName: "Poppins (Geometric)" },
  { name: "Montserrat", value: "Montserrat", displayName: "Montserrat (Elegant)" },
  { name: "Nunito", value: "Nunito", displayName: "Nunito (Rounded)" },
  { name: "Source Sans 3", value: "Source Sans 3", displayName: "Source Sans 3 (Professional)" },
  { name: "Work Sans", value: "Work Sans", displayName: "Work Sans (Contemporary)" },
]

export function getRandomTaskColor(themeName: ThemeName, mode: ThemeMode): string {
  const colors = getThemeColors(themeName, mode)
  const randomIndex = Math.floor(Math.random() * colors.taskSubcolors.length)
  return colors.taskSubcolors[randomIndex]
} 