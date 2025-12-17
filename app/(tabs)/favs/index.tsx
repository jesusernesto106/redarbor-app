import { fetchRemoteJobs } from '@/src/services/remotive';
import { useFavsStore } from '@/src/store/useFavsStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function FavoritesScreen() {
  const favoriteIds = useFavsStore((s) => s.favoriteIds);
  const toggleFavorite = useFavsStore((s) => s.toggleFavorite);

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadFavorites() {
    if (favoriteIds.length === 0) {
      setJobs([]);
      return;
    }

    try {
      setLoading(true);
      const allJobs = await fetchRemoteJobs();
      const favJobs = allJobs.filter((job: any) =>
        favoriteIds.includes(job.id)
      );
      setJobs(favJobs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, [favoriteIds]);

  // 🟡 ESTADO VACÍO
  if (!loading && favoriteIds.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="star-outline" size={48} color="#777" />
        <Text style={styles.emptyText}>
          No tienes empleos guardados
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/favs/${item.id}`)}
          >
            {item.company_logo ? (
              <Image
                source={{ uri: item.company_logo }}
                style={styles.logo}
              />
            ) : (
              <View style={styles.logoPlaceholder} />
            )}

            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.company}>{item.company_name}</Text>
              <Text style={styles.meta}>
                {item.candidate_required_location}
              </Text>
            </View>

            {/* QUITAR FAVORITO */}
            <Pressable onPress={() => toggleFavorite(item.id)}>
              <Ionicons
                name="star"
                size={22}
                color="#FFD700"
              />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  list: {
    padding: 16,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },

  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#222',
  },

  info: {
    flex: 1,
  },

  title: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  company: {
    color: '#ccc',
    fontSize: 13,
    marginTop: 2,
  },

  meta: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    gap: 12,
  },

  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});
