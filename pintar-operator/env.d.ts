declare module 'react-native-config' {
    interface Env {
      EXPO_SERVER_HOST: string;
      // Add other environment variables here
    }
  
    const Config: Env;
    export default Config;
  }