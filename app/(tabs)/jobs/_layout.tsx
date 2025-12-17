import { Stack } from 'expo-router';

export default function JobsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Empleos' }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: 'Detalle del empleo' }}
      />
    </Stack>
  );
}
