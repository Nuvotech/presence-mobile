import { Drawer } from 'expo-router/drawer';
import { DrawerContent } from '../../components/DrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{ headerShown: false, swipeEnabled: false }}
      drawerContent={(props) => <DrawerContent {...props} />}>
      <Drawer.Screen name="home" />
      <Drawer.Screen name="profile" />
      <Drawer.Screen name="register" />
      <Drawer.Screen name="register-student" />
      <Drawer.Screen name="class-scanner" />
      <Drawer.Screen name="scanner" />
      <Drawer.Screen name="id-card" />
      <Drawer.Screen name="history" />
      <Drawer.Screen name="history/[id]" />
    </Drawer>
  );
}
