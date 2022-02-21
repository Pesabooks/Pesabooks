import { extendTheme, withDefaultColorScheme, type ThemeConfig } from '@chakra-ui/react';
import { CardComponent } from './additions/card/Card';
import { CardBodyComponent } from './additions/card/CardBody';
import { CardHeaderComponent } from './additions/card/CardHeader';
import { MainPanelComponent } from './additions/layout/MainPanel';
import { PanelContainerComponent } from './additions/layout/PanelContainer';
import { PanelContentComponent } from './additions/layout/PanelContent';
import { badgeStyles } from './components/badge';
import { buttonStyles } from './components/button';
import { drawerStyles } from './components/drawer';
import { linkStyles } from './components/link';
import { breakpoints } from './foundations/breakpoints';
import { font } from './foundations/fonts';
import { globalStyles } from './styles';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

export default extendTheme(
  { breakpoints }, // Breakpoints
  globalStyles,
  font, // Global styles
  buttonStyles, // Button styles
  badgeStyles, // Badge styles
  linkStyles, // Link styles
  drawerStyles, // Sidebar variant for Chakra's drawer
  CardComponent, // Card component
  CardBodyComponent, // Card Body component
  CardHeaderComponent, // Card Header component
  MainPanelComponent, // Main Panel component
  PanelContentComponent, // Panel Content component
  PanelContainerComponent, // Panel Container component
  withDefaultColorScheme({ colorScheme: 'teal' }),
  config,
);
