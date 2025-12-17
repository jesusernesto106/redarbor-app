import JobDetail from '@/components/JobDetail';
import { useLocalSearchParams } from 'expo-router';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <JobDetail jobId={Number(id)} />;
}
