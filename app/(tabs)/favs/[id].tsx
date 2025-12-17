import { fetchJobById } from '@/src/services/remotive';
import { useFavsStore } from '@/src/store/useFavsStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import RenderHTML from 'react-native-render-html';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = Number(id);

  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleFavorite = useFavsStore((s) => s.toggleFavorite);
  const favoriteIds = useFavsStore((s) => s.favoriteIds);

  const { width } = useWindowDimensions();

  useEffect(() => {
    async function loadJob() {
      try {
        setLoading(true);
        const data = await fetchJobById(jobId);
        if (!data) throw new Error('Empleo no encontrado');
        setJob(data);
      } catch (e) {
        setError('No se pudo cargar el empleo');
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {job.company_logo ? (
          <Image source={{ uri: job.company_logo }} style={styles.logo} />
        ) : null}

        <View style={styles.headerInfo}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company_name}</Text>
          <Text style={styles.meta}>{job.candidate_required_location}</Text>
        </View>

        {/* FAVORITO */}
        <Pressable onPress={() => toggleFavorite(job.id)}>
          <Ionicons
            name={
              favoriteIds.includes(job.id) ? 'star' : 'star-outline'
            }
            size={26}
            color={
              favoriteIds.includes(job.id) ? '#FFD700' : '#999'
            }
          />
        </Pressable>
      </View>

      {/* INFO */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Categoría: <Text style={styles.value}>{job.category}</Text>
        </Text>
        <Text style={styles.label}>
          Tipo: <Text style={styles.value}>{job.job_type}</Text>
        </Text>
        {job.salary && (
          <Text style={styles.label}>
            Salario: <Text style={styles.value}>{job.salary}</Text>
          </Text>
        )}
        <Text style={styles.label}>
          Publicado:{' '}
          <Text style={styles.value}>
            {new Date(job.publication_date).toLocaleDateString()}
          </Text>
        </Text>
      </View>

      {/* DESCRIPCIÓN */}
      <View style={styles.section}>
        <RenderHTML
          contentWidth={width}
          source={{ html: job.description }}
          baseStyle={{
            color: '#ddd',
            lineHeight: 22,
            fontSize: 14,
          }}
          tagsStyles={{
            h1: { color: '#fff' },
            h2: { color: '#fff' },
            h3: { color: '#fff' },
            a: { color: '#4da3ff' },
            li: { color: '#ddd' },
            p: { color: '#ddd' },
          }}
        />
      </View>

      {/* ACCIONES */}
      <View style={styles.actions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => Linking.openURL(job.url)}
        >
          <Text style={styles.actionText}>Aplicar</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            Share.share({
              title: job.title,
              message: `${job.title} en ${job.company_name}\n${job.url}`,
            })
          }
        >
          <Text style={styles.secondaryText}>Compartir</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#000',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  error: {
    color: '#ff6b6b',
    fontSize: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 12,
  },

  logo: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#222',
  },

  headerInfo: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  company: {
    fontSize: 14,
    marginTop: 4,
    color: '#ccc',
  },

  meta: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  section: {
    marginBottom: 20,
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 12,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#bbb',
  },

  value: {
    fontWeight: '600',
    color: '#fff',
  },

  actions: {
    gap: 12,
    marginBottom: 32,
  },

  actionButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  actionText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  secondaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
