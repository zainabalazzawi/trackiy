import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, X } from "lucide-react";

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  label?: string;
  type?: "input" | "textarea";
  titleText?: boolean;
  fieldId?: string;
}

const EditableField = ({
  value,
  onSave,
  label,
  type = "input",
  titleText,
  fieldId = "default",
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // Check for other users typing
  useEffect(() => {
    const check = () => {
      const data = localStorage.getItem(`typing_${fieldId}`);
      if (data) {
        const { user, time } = JSON.parse(data);
        const currentUser = localStorage.getItem('user') || 'User1';
        
        // If someone else is typing and it's recent (3 seconds)
        if (user !== currentUser && Date.now() - time < 3000) {
          setTypingUser(user);
        } else {
          setTypingUser(null);
        }
      } else {
        setTypingUser(null);
      }
    };

    check();
    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, [fieldId]);

  const handleTyping = () => {
    const currentUser = localStorage.getItem('user') || 'User1';
    localStorage.setItem(`typing_${fieldId}`, JSON.stringify({
      user: currentUser,
      time: Date.now()
    }));
  };

  const handleSave = () => {
    onSave(editedValue);
    setIsEditing(false);
    localStorage.removeItem(`typing_${fieldId}`);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {type === "textarea" ? (
            <Textarea
              value={editedValue}
              onChange={(e) => {
                setEditedValue(e.target.value);
                handleTyping();
              }}
              autoFocus
            />
          ) : (
            <Input
              value={editedValue}
              onChange={(e) => {
                setEditedValue(e.target.value);
                handleTyping();
              }}
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
              localStorage.removeItem(`typing_${fieldId}`);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Show typing indicator */}
        {typingUser && (
          <div className="text-sm text-gray-600 italic">
            {typingUser} is typing...
          </div>
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