import { useDroppable } from '@dnd-kit/core';
import { Column as ColumnType } from '../types';
import TicketCard from './TicketCard';
import axios from 'axios';
import { KeyboardEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface ColumnProps {
  column: ColumnType;
  children?: React.ReactNode;
  projectId: string
}

const Column = ({ column, children, projectId }: ColumnProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column
    }
  });

  const updateColumnName = async (id: string, newName: string) => {
    const response = await axios.patch(`/api/projects/${projectId}/columns`, { 
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

  const deleteColumn = async (id: string) => {
    const response = await axios.delete(`/api/projects/${projectId}/columns`, {
      data: { id }
    });
    return response.data;
  };

  const deleteColumnMutation = useMutation({
    mutationFn: (id: string) => deleteColumn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
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
        p-4 pr-2
        rounded-md
        w-80
        ${isOver ? 'bg-gray-300' : 'bg-gray-200 '}
      `}
    >
      <div className="mb-4 flex justify-between">
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
            className="text-gray-700 cursor-pointer hover:text-gray-900 hover:bg-gray-100 hover:w-[80%] rounded-md pl-2 py-1"
            onClick={() => setIsEditing(true)}
          >
            {column.name}
          </h2>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className='w-48'>
            <DropdownMenuItem
              onClick={() => setOpen(true)}
              className="text-red-800"
            >
              <Trash2 className="mr-2 text-red-800" size={16} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="space-y-3">
        {children}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete column?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this column? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                deleteColumnMutation.mutate(column.id);
                setOpen(false);
              }}
              disabled={deleteColumnMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Column;