// react-native-svg (15.x) implements remote-SVG loading (`SvgUri`) in its
// internal xml module but no longer re-exports it from the package root.
// Minimal ambient typing for the deep import we use in ClubBadge.tsx.
declare module 'react-native-svg/lib/module/xml' {
  import { ComponentType } from 'react';
  import { SvgProps } from 'react-native-svg';

  export type SvgUriProps = SvgProps & {
    uri: string | null;
    onError?: (error: Error) => void;
    onLoad?: () => void;
    fallback?: JSX.Element;
  };

  export const SvgUri: ComponentType<SvgUriProps>;
}
