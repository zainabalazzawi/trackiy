import { Column as ColumnType } from '../types';
import TicketCard from './TicketCard';
import axios from 'axios';
import { KeyboardEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ColumnProps {
  column: ColumnType;
}

const Column = ({ column }: ColumnProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const queryClient = useQueryClient();

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
    <div className="bg-gray-200 p-4 rounded-lg w-80">
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
          />
        ) : (
          <h2 
            className="font- text-gray-700 cursor-pointer hover:text-gray-900"
            onClick={() => setIsEditing(true)}
          >
            {column.name}
          </h2>
        )}
      </div>
      <div className="space-y-3">
        {column.tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
};

export default Column;