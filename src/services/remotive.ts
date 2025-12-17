export type RemotiveJob = {
  id: number;
  title: string;
  company_name: string;
  company_logo: string | null;
  candidate_required_location: string;
  publication_date: string;
  job_type: string;
  url: string;
};

export type RemotiveCategory = {
  id: number;
  name: string;
};

export async function fetchRemoteJobs(
  search?: string,
  category?: string,
  jobType?: string
): Promise<RemotiveJob[]> {
  const params = new URLSearchParams();

  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (jobType) params.append('job_type', jobType);

  const response = await fetch(
    `https://remotive.com/api/remote-jobs?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('Error al obtener empleos');
  }

  const data = await response.json();
  return data.jobs;
}

export async function fetchCategories(): Promise<RemotiveCategory[]> {
  const response = await fetch(
    'https://remotive.com/api/remote-jobs/categories'
  );

  if (!response.ok) {
    throw new Error('Error al obtener categorías');
  }

  const data = await response.json();
  return data.jobs;
}

export async function fetchJobById(id: number) {
  const response = await fetch('https://remotive.com/api/remote-jobs');
  if (!response.ok) {
    throw new Error('Error al cargar el empleo');
  }

  const data = await response.json();
  return data.jobs.find((job: any) => job.id === id);
}

