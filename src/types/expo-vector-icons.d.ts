declare module '@expo/vector-icons' {
  export * from '@expo/vector-icons/build/vendor/react-native-vector-icons';
}

declare module '@expo/vector-icons/Feather' {
  import { Icon } from '@expo/vector-icons/build/vendor/react-native-vector-icons';
  export const Feather: typeof Icon;
  export default Feather;
}
