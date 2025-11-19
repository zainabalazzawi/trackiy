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
        py-4
        rounded-xl
        w-60 sm:w-full
        flex-shrink-0 sm:flex-shrink
        flex
        flex-col
        border
        transition-all
        duration-300
        backdrop-blur-sm
        ${isOver ? 'bg-gradient-to-b from-[#649C9E]/25 via-[#649C9E]/15 to-[#649C9E]/10 border-[#649C9E] scale-[1.02]' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-white border-slate-200/80 hover:border-slate-300'}
      `}
    >
      <div className="mb-3 flex justify-between items-center px-3 h-[3%]">
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
            className='bg-white border-slate-300'
          />
        ) : (
          <h2 
            className="text-slate-700 font-semibold cursor-pointer py-2 text-sm"
            onClick={() => setIsEditing(true)}
          >
            {column.name}
          </h2>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-white/60 rounded-lg">
              <MoreVertical size={18} className="text-slate-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className='w-48 border-slate-200'>
            <DropdownMenuItem
              onClick={() => setOpen(true)}
              className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
            >
              <Trash2 className="mr-2 text-red-600" size={16} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='border-slate-300/60 border-t mb-2 mx-2'/>
      <div className='px-2 overflow-y-auto flex-1 space-y-2'>
        {children}
      </div>

      {/* delete col */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Delete column?</DialogTitle>
            <DialogDescription className="text-slate-600">
              Are you sure you want to delete this column? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-slate-300 hover:bg-slate-100">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                                  deleteColumn(column.id);
                setOpen(false);
              }}
                                disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


export default Column;