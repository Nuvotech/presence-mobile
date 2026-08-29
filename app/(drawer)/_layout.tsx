import { Drawer } from 'expo-router/drawer';
import { DrawerContent } from '../../components/DrawerContent';
import { colors } from '../../theme/tokens';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        swipeEnabled: false,
        drawerStyle: { backgroundColor: colors.surface },
        overlayColor: 'rgba(38, 33, 74, 0.4)',
      }}
      drawerContent={(props) => <DrawerContent {...props} />}>
      <Drawer.Screen name="home" />
      <Drawer.Screen name="profile" />
      <Drawer.Screen name="register" />
      <Drawer.Screen name="register-student" />
      <Drawer.Screen name="class-scanner" />
      <Drawer.Screen name="scanner" />
      <Drawer.Screen name="id-card" />
      <Drawer.Screen name="student" />
      <Drawer.Screen name="timetable" />
      <Drawer.Screen name="history" />
      <Drawer.Screen name="history/[id]" />
    </Drawer>
  );
}
