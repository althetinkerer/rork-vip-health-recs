import { Redirect } from 'expo-router';
import { useData } from '@/context/DataContext';

export default function IndexScreen() {
  const { isAuthenticated } = useData();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/auth" />;
}
