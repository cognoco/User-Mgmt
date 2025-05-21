import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/database/supabase';

interface Item {
  id: string;
  title: string;
  description: string;
}

export const Dashboard: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    const { data, error } = await supabase.from('items').select('*');
    if (error) {
      setError(error.message);
    } else {
      setItems(data || []);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (title: string, description: string) => {
    // console.log('[TEST_DEBUG] handleCreate called');
    // const { data, error } = await supabase // Original
    const { error } = await supabase // Remove unused 'data'
      .from('items')
      .insert([{ title, description }]);
    // console.log('[TEST_DEBUG] handleCreate insert response:', { data, error });
    
    if (error) {
      setError(error.message);
    } else {
      await fetchItems();
      setIsEditing(false);
    }
  };

  const handleUpdate = async (id: string, title: string, description: string) => {
    // console.log('[TEST_DEBUG] handleUpdate called');
    // const { data, error } = await supabase // Original
    const { error } = await supabase // Remove unused 'data'
      .from('items')
      .update({ title, description })
      .eq('id', id);
    // console.log('[TEST_DEBUG] handleUpdate update response:', { data, error });

    if (error) {
      setError(error.message);
    } else {
      await fetchItems();
      setIsEditing(false);
      setCurrentItem(null);
    }
  };

  const handleDelete = async (id: string) => {
    // console.log('[TEST_DEBUG] handleDelete called');
    // const { data, error } = await supabase // Original
    const { error } = await supabase // Remove unused 'data'
      .from('items')
      .delete()
      .eq('id', id);
    // console.log('[TEST_DEBUG] handleDelete delete response:', { data, error });

    if (error) {
      setError(error.message);
    } else {
      await fetchItems();
    }
  };

  return (
    <div>
      {error && <div role="alert">{error}</div>}
      
      <button onClick={() => setIsEditing(true)}>Create New</button>

      {isEditing && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const title = (form.elements.namedItem('title') as HTMLInputElement).value;
          const description = (form.elements.namedItem('description') as HTMLInputElement).value;
          
          if (currentItem) {
            handleUpdate(currentItem.id, title, description);
          } else {
            handleCreate(title, description);
          }
        }}>
          <div>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              defaultValue={currentItem?.title || ''}
            />
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              defaultValue={currentItem?.description || ''}
            />
          </div>
          <button type="submit">Save</button>
        </form>
      )}

      {items.length === 0 ? (
        <div>No items found</div>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.title}</span>
              <button onClick={() => {
                setCurrentItem(item);
                setIsEditing(true);
              }}>Edit</button>
              <button onClick={() => {
                if (window.confirm('Are you sure?')) {
                  handleDelete(item.id);
                }
              }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 