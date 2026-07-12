import { theme, type ThemeConfig } from 'antd';

const sharedTokens = {
  colorPrimary: '#FF6B00',
  borderRadius: 8,
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
};

export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...sharedTokens,
    colorBgBase: '#FFFFFF',
    colorTextBase: '#1A1A1A',
    colorBgContainer: '#FFFFFF',
  },
  components: {
    Button: {
      colorPrimaryHover: '#FF8533',
      colorPrimaryActive: '#E05E00',
    },
  },
};

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...sharedTokens,
    colorBgBase: '#121212',
    colorTextBase: '#F4F7FC',
    colorBgContainer: '#1E1E1E',
  },
  components: {
    Button: {
      colorPrimaryHover: '#FF8533',
      colorPrimaryActive: '#E05E00',
    },
  },
};

export const highContrastTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...sharedTokens,
    colorBgBase: '#000000',
    colorTextBase: '#FFFFFF',
    colorBgContainer: '#000000',
  },
  components: {
    Button: {
      colorPrimaryHover: '#FFA366',
      colorPrimaryActive: '#FF6B00',
    },
  },
};

export function getAntdTheme(mode: 'light' | 'dark' | 'high-contrast'): ThemeConfig {
  switch (mode) {
    case 'dark':
      return darkTheme;
    case 'high-contrast':
      return highContrastTheme;
    case 'light':
    default:
      return lightTheme;
  }
}
