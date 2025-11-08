import { useDroppable } from '@dnd-kit/core';
import { Column as ColumnType } from '../types';

import { KeyboardEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useUpdateColumn, useDeleteColumn } from '@/app/hooks/useColumns';
import { Button } from '@/components/ui/button';
import { Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import {
  Dialog,
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

  const [open, setOpen] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column
    }
  });

  const { updateColumn } = useUpdateColumn(projectId);

  const { deleteColumn, isDeleting } = useDeleteColumn(projectId);

  const handleNameSubmit = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateColumn({ 
        id: column.id, 
        name 
      }, {
        onSuccess: () => {
          setIsEditing(false);
        },
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
        py-2 sm:py-3 md:py-4
        rounded-md
        min-w-[280px] sm:min-w-[300px] w-[85vw] sm:w-[60%] md:w-auto flex-shrink-0
        ${isOver ? 'bg-gray-300' : 'bg-gray-200'}
      `}
    >
      <div className="mb-2 sm:mb-3 md:mb-4 flex justify-between items-center gap-2 px-2 sm:px-3">
        {/* edit col name */}
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
            className='bg-gray-100 text-sm sm:text-base flex-1 min-w-0'
          />
        ) : (
          <h2 
            className="text-gray-700 cursor-pointer hover:text-gray-900 hover:bg-gray-100 rounded-md pl-2 py-1.5 sm:py-2 text-sm sm:text-base truncate flex-1 min-w-0"
            onClick={() => setIsEditing(true)}
          >
            {column.name}
          </h2>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 touch-manipulation"
            >
              <MoreVertical size={18} className="sm:w-5 sm:h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className='w-40 sm:w-48'>
            <DropdownMenuItem
              onClick={() => setOpen(true)}
              className="text-red-800 cursor-pointer"
            >
              <Trash2 className="mr-2 text-red-800" size={16} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='border-gray-50 border-1 mb-1 sm:mb-2'/>
      <div className='px-1 sm:px-2'>
        {children}
      </div>

      {/* delete col */}
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
                                  deleteColumn(column.id);
                setOpen(false);
              }}
                                disabled={isDeleting}
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