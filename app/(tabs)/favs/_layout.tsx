import { Stack } from 'expo-router';

export default function FavoritesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Favoritos' }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: 'Detalle del empleo' }}
      />
    </Stack>
  );
}
