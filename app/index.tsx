import { Redirect } from 'expo-router';

// Redirect to the sign-in screen by default
export default function Index() {
  return <Redirect href="/(auth)/sign-in" />;
}