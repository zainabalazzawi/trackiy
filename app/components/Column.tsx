import { useDroppable } from '@dnd-kit/core';
import { Column as ColumnType } from '../types';
import TicketCard from './TicketCard';
import axios from 'axios';
import { KeyboardEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ColumnProps {
  column: ColumnType;
  children?: React.ReactNode;
}

const Column = ({ column, children }: ColumnProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const queryClient = useQueryClient();

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column
    }
  });

  const updateColumnName = async (id: string, newName: string) => {
    const response = await axios.patch('/api/columns', { 
      id, 
      name: newName,
      status: newName
    });
    return response.data;
  }

  const updateColumnMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      updateColumnName(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      setIsEditing(false);
    },
  });

  const handleNameSubmit = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateColumnMutation.mutate({ 
        id: column.id, 
        name 
      });
    } else if (e.key === 'Escape') {
      setName(column.name);
      setIsEditing(false);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={`
        p-4 
        rounded-lg 
        w-80
        ${isOver ? 'bg-gray-300' : 'bg-gray-200 '}
      `}
    >
      <div className="mb-4">
        {isEditing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleNameSubmit}
            onBlur={() => {
              setName(column.name);
              setIsEditing(false);
            }}
            autoFocus
            className='bg-gray-100'
          />
        ) : (
          <h2 
            className=" text-gray-700 cursor-pointer hover:text-gray-900 hover:bg-gray-100 rounded-lg pl-2 py-1"
            onClick={() => setIsEditing(true)}
          >
            {column.name}
          </h2>
        )}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

export default Column;