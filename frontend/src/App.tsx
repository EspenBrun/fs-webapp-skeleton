import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();

function Hello() {
  const { isLoading, error, data } = useQuery({
    queryKey: ['hello'],
    queryFn: () => fetch('http://localhost:5273').then((res) => res.text()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className='flex min-h-screen w-full flex-col bg-gray-100 p-4 text-gray-800 dark:bg-slate-800 dark:text-white'>
      <h1 className='text-3xl font-bold'>Todo</h1>
      <p className='pt-4'>{data}</p>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Hello />
    </QueryClientProvider>
  );
}
