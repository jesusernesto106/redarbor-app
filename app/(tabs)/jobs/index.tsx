import { fetchCategories, fetchRemoteJobs } from '@/src/services/remotive';
import { useFavsStore } from '@/src/store/useFavsStore';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default function JobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [jobType, setJobType] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const toggleFavorite = useFavsStore((state) => state.toggleFavorite);
  const favoriteIds = useFavsStore((state) => state.favoriteIds);

  async function loadJobs(
    query?: string,
    category?: string,
    type?: string
  ) {
    try {
      setLoading(true);
      setError(null); // 👈 LIMPIA ERRORES ANTERIORES

      const data = await fetchRemoteJobs(query, category, type);
      setJobs(data);
    } catch (e) {
      console.error(e);
      setError('Ocurrió un error al cargar los empleos');
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadJobs(search, selectedCategory, jobType);
    setRefreshing(false);
  }

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(console.error);
    loadJobs();
  }, []);

  if (loading && jobs.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.message}>Cargando empleos…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>

        <Pressable
          onPress={() => loadJobs(search, selectedCategory, jobType)}
        >
          <Text style={styles.retry}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Buscador */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por puesto o empresa"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
        <Pressable
          style={styles.button}
          onPress={() => loadJobs(search, selectedCategory, jobType)}
        >
          <Text style={styles.buttonText}>Buscar</Text>
        </Pressable>
      </View>

      {/* Categorías */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            loadJobs(search, value);
          }}
          style={styles.picker}
          dropdownIconColor="#fff"
        >
          <Picker.Item label="Todas las categorías" value={undefined} />
          {categories.map((cat) => (
            <Picker.Item
              key={cat.id}
              label={cat.name}
              value={cat.name}
              color="#000"   // iOS
            />
          ))}
        </Picker>
      </View>

      {/* Tipo de trabajo */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={jobType}
          onValueChange={(value) => {
            setJobType(value);
            loadJobs(search, selectedCategory, value);
          }}
          style={styles.picker}
          dropdownIconColor="#fff"
        >
          <Picker.Item label="Todos los tipos" value={undefined} />
          <Picker.Item label="Full Time" value="full_time" />
          <Picker.Item label="Contract" value="contract" />
          <Picker.Item label="Part Time" value="part_time" />
          <Picker.Item label="Freelance" value="freelance" />
          <Picker.Item label="Internship" value="internship" />
        </Picker>
      </View>

      {/* Lista */}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"      // iOS (fondo oscuro)
            colors={['#000']}     // Android
          />
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No hay resultados</Text>
          ) : null
        }

        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/jobs/${item.id}`)}
          >
            {item.company_logo ? (
              <Image source={{ uri: item.company_logo }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder} />
            )}

            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.company}>{item.company_name}</Text>
              <Text style={styles.meta}>
                {item.candidate_required_location}
              </Text>
              <Text style={styles.date}>
                {formatDate(item.publication_date)}
              </Text>
            </View>

            {/* FAVORITOS */}
            <Pressable onPress={() => toggleFavorite(item.id)}>
              <Ionicons
                name={favoriteIds.includes(item.id) ? 'star' : 'star-outline'}
                size={22}
                color={favoriteIds.includes(item.id) ? '#FFD700' : '#999'}
              />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  /* 🔍 BUSCADOR */
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },

  input: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#111',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#222',
  },

  button: {
    backgroundColor: '#222',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  /* 🔽 PICKERS */
  pickerContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#111',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
  },

  picker: {
    height: 56,
    color: '#fff',
  },

  /* 📃 LISTA */
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

  date: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },

  /* ⭐ ESTADOS */
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  message: {
    marginTop: 12,
    color: '#ccc',
    fontSize: 16,
  },

  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
  },

  retry: {
    marginTop: 12,
    color: '#4da3ff',
    fontSize: 16,
  },

  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
});

