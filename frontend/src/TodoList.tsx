import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import clsx from 'clsx';
import { get, post, put, remove } from './http';

const resource = 'todos';

type Todo = {
  id: number;
  description: string;
  status: string;
};

const useTodoQuery = () =>
  useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: () => get(resource),
  });

const useTodoMutations = () => {
  const queryClient = useQueryClient();
  const onSuccess = async () => await queryClient.invalidateQueries({ queryKey: ['todos'] });

  return {
    createMutation: useMutation({
      mutationFn: (todo: Omit<Todo, 'id'>) => post(resource, todo),
      onSuccess,
    }),
    updateMutation: useMutation({
      mutationFn: (todo: Todo) => put(resource, todo),
      onSuccess,
    }),
    deleteMutation: useMutation({
      mutationFn: (id: number) => remove(resource, id),
      onSuccess,
    }),
  };
};

export default function TodoList() {
  const [newTodo, setNewTodo] = useState({ description: '', status: 'todo' });
  const [editTodo, setEditTodo] = useState<Todo | null>(null);

  const todoQuery = useTodoQuery();
  const todos = todoQuery.data ?? [];

  const { createMutation, updateMutation, deleteMutation } = useTodoMutations();

  return (
    <div className='pt-12'>
      <div className='mx-auto max-w-3xl overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-white/10'>
        <div className='border-b border-slate-200/70 px-4 py-5 sm:px-6 dark:border-white/10'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h2 className='text-base leading-6 font-semibold text-slate-900 dark:text-white'>Todos</h2>
              <p className='mt-1 text-sm text-slate-600 dark:text-slate-300'>Keep track of what you need to do.</p>
            </div>
            <div className='text-sm text-slate-500 dark:text-slate-400'>
              {todoQuery.isLoading ? 'Loading…' : `${todos.length} item${todos.length === 1 ? '' : 's'}`}
            </div>
          </div>

          <div className='mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end'>
            <div>
              <label htmlFor='new-todo' className='block text-sm font-medium text-slate-700 dark:text-slate-200'>
                Add a todo
              </label>
              <div className='mt-2'>
                <input
                  id='new-todo'
                  type='text'
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  placeholder='E.g. Plan route for Saturday'
                  className='block w-full rounded-md bg-white px-3 py-2 text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none dark:bg-slate-950 dark:text-white dark:ring-white/10 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500'
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    if (newTodo.description.trim().length === 0) return;
                    createMutation.mutate(newTodo, {
                      onSuccess: () => setNewTodo({ description: '', status: 'todo' }),
                    });
                  }}
                />
              </div>
            </div>

            <button
              type='button'
              disabled={newTodo.description.trim().length === 0}
              onClick={() => {
                if (newTodo.description.trim().length === 0) return;
                createMutation.mutate(newTodo, {
                  onSuccess: () => setNewTodo({ description: '', status: 'todo' }),
                });
              }}
              className='inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:outline-indigo-500'
            >
              Add
            </button>
          </div>

          {todoQuery.isError ? (
            <div className='mt-4 rounded-md bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-600/10 ring-inset dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-400/20'>
              Failed to load todos.
              {' ' + (todoQuery.error instanceof Error ? todoQuery.error.message : '')}
            </div>
          ) : null}
        </div>

        <div className='bg-slate-50 dark:bg-slate-950/30'>
          <ul role='list' className='divide-y divide-slate-200/70 dark:divide-white/10'>
            {todos.map((todo) => (
              <li key={todo.id} className='px-4 py-4 sm:px-6'>
                {editTodo?.id === todo.id ? (
                  <div className='grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start'>
                    <input
                      type='text'
                      value={editTodo.description}
                      onChange={(e) => setEditTodo({ ...editTodo, description: e.target.value })}
                      className='block w-full rounded-md bg-white px-3 py-2 text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none dark:bg-slate-950 dark:text-white dark:ring-white/10 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500'
                    />

                    <div className='flex flex-wrap gap-2 sm:justify-end'>
                      <button
                        type='button'
                        disabled={updateMutation.isPending || editTodo.description.trim().length === 0}
                        onClick={() => {
                          if (editTodo.description.trim().length === 0) return;
                          updateMutation.mutate(editTodo, { onSuccess: () => setEditTodo(null) });
                        }}
                        className='inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Save
                      </button>
                      <button
                        type='button'
                        onClick={() => setEditTodo(null)}
                        className='inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset hover:bg-slate-50 dark:bg-slate-950 dark:text-white dark:ring-white/10 dark:hover:bg-white/5'
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='flex items-start justify-between gap-4'>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-3'>
                        <input
                          aria-label='Toggle done'
                          type='checkbox'
                          checked={todo.status === 'done'}
                          onChange={(e) => {
                            const nextStatus = e.target.checked ? 'done' : 'todo';
                            updateMutation.mutate({ ...todo, status: nextStatus });
                          }}
                          className='mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 dark:border-white/20 dark:bg-slate-950 dark:focus:ring-indigo-500'
                        />
                        <p
                          className={clsx(
                            'truncate text-sm font-medium',
                            todo.status === 'done'
                              ? 'text-slate-400 line-through dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          )}
                        >
                          {todo.description}
                        </p>
                      </div>
                    </div>

                    <div className='flex flex-none items-center gap-2'>
                      <button
                        type='button'
                        onClick={() => setEditTodo(todo)}
                        className='inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset hover:bg-slate-50 dark:bg-slate-950 dark:text-white dark:ring-white/10 dark:hover:bg-white/5'
                      >
                        Edit
                      </button>
                      <button
                        type='button'
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(todo.id)}
                        className='inline-flex items-center justify-center rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
