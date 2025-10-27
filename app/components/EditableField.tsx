import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, X } from "lucide-react";
import { useTypingIndicator } from "@/app/hooks/useTypingIndicator";

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  label?: string;
  type?: "input" | "textarea";
  titleText?: boolean;
  ticketId?: string;
  fieldId?: string;
}

const EditableField = ({
  value,
  onSave,
  label,
  type = "input",
  titleText,
  ticketId,
  fieldId,
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  
  // Use typing indicator if ticketId and fieldId are provided
  const { typingMessage, startTyping, stopTyping } = useTypingIndicator(
    ticketId || "",
    fieldId || ""
  );

  // Start/stop typing indicator when editing
  useEffect(() => {
    if (isEditing && ticketId && fieldId) {
      startTyping();
      return () => {
        stopTyping();
      };
    }
  }, [isEditing, ticketId, fieldId, startTyping, stopTyping]);

  const handleSave = () => {
    onSave(editedValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div>
        <div className="flex items-center gap-2">
          {type === "textarea" ? (
            <Textarea
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              autoFocus
            />
          ) : (
            <Input
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              autoFocus
            />
          )}
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsEditing(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {typingMessage && (
          <p className="text-sm text-gray-500 mt-1">{typingMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center">
      {label && <span className="text-sm">{label}</span>}
      <div className="flex gap-2">
        <span className={`${titleText ? "font-bold text-lg" : ""}`}>
          {value}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
export default EditableField;
