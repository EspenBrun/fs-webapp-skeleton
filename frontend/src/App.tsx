import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoList from './TodoList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white'>
        <TodoList />
      </div>
    </QueryClientProvider>
  );
}
