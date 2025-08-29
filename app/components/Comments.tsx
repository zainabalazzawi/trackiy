"use client";

import { useState } from "react";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "@/app/hooks/useComments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatCommentDate } from "@/lib/utils";
import { MessageSquare, Send, Trash2, Edit3 } from "lucide-react";
import EditableField from "@/app/components/EditableField";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface CommentsProps {
  projectId: string;
  ticketId: string;
}

const Comments = ({ projectId, ticketId }: CommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const { comments } = useComments(projectId, ticketId);
  const { createComment, isCreating } = useCreateComment(projectId, ticketId);
  const { deleteComment, isDeleting } = useDeleteComment(projectId, ticketId);
  const { updateComment, isUpdating } = useUpdateComment(projectId, ticketId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && !isCreating) {
      createComment({ content: newComment.trim() });
      setNewComment("");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (commentToDelete) {
      deleteComment(commentToDelete);
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateComment = (commentId: string, content: string) => {
    updateComment({ commentId, content });
  };

  return (
    <div className="space-y-3 w-[65%]">
      <div className="flex items-center gap-2 text-gray-500">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-medium">Comments</h3>
        <span className="text-sm">({comments.length})</span>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isCreating}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newComment.trim() || isCreating}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isCreating ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No comments yet. Be the first to add one!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex flex-col gap-3 p-4 bg-gray-50"
            >
              <div className="flex flex-row items-center justify-between gap-2">
                <div className="flex flex-row items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={comment.user.image?.replace("s96-c", "s400-c")}
                      alt={comment.user.name}
                    />
                    <AvatarFallback className="text-xs">
                      {comment.user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm text-gray-900">
                    {comment.user.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatCommentDate(comment.createdAt)}
                  </span>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={isDeleting}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="ml-5">
                <EditableField
                  value={comment.content}
                  onSave={(value) => handleUpdateComment(comment.id, value)}
                  type="textarea"
                />
              </div>
            </div>
          ))
        )}
      </div>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Comments;
