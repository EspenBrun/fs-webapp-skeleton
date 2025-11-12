const api = 'http://localhost:5273/api';

type Resource = 'todos'

export const get = async (resource: Resource) =>
  fetch(`${api}/${resource}`).then((res) => {
    if (!res.ok) throw new Error('Failed to get resources');
    return res.json();
  });

export const post = async (resource: Resource, dto: any) =>
  fetch(`${api}/${resource}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to create resource');
    return res.json();
  });


export const put = async (
  resource: Resource,
  dto: { id: number; [key: string]: any }
) =>
  fetch(`${api}/${resource}/${dto.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to update resource');
    return res.json();
  });

export const remove = async (resource: Resource, id: number) =>
  fetch(`${api}/${resource}/${id}`, {
    method: 'DELETE',
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to delete resource');
    return null;
  });
