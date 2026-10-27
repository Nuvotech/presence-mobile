import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAppStore } from '../store/useAppStore';

// A signed-in parent goes straight to their inbox (e.g. when opening the app
// from a push); everyone else starts at the login screen.
export default function Index() {
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated());
  const parentGuardian = useAppStore((s) => s.parentGuardian);

  useEffect(() => useAppStore.persist.onFinishHydration(() => setHydrated(true)), []);

  if (!hydrated) {
    return null;
  }

  if (parentGuardian) {
    return (
      <Redirect href={parentGuardian.must_change_password ? '/parent/password' : '/parent/home'} />
    );
  }

  return <Redirect href="/login" />;
}
