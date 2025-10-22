import { useState } from "react";
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
  isEditing?: boolean;
  onEditStart?: () => void;
}

const EditableField = ({
  value,
  onSave,
  label,
  type = "input",
  titleText,
  isEditing: externalIsEditing = false,
  onEditStart,
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  const handleEditStart = () => {
    setIsEditing(true);
    onEditStart?.();
  };






  const handleSave = () => {
    onSave(editedValue);
    setIsEditing(false);
  };




console.log("externalIsEditing:", externalIsEditing);


  if (isEditing || externalIsEditing) {
    return (
      <div className="flex items-center gap-2">
        {externalIsEditing && !isEditing && (
          <div className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
            Someone else is editing this field
          </div>
        )}
        {type === "textarea" ? (
          <Textarea
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            autoFocus
            disabled={externalIsEditing && !isEditing}
          />
        ) : (
          <Input
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            autoFocus
            disabled={externalIsEditing && !isEditing}
          />
        )}
        <Button size="sm" onClick={handleSave} disabled={externalIsEditing && !isEditing}>
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
    );
  }

  return (
    <div className="flex flex-row items-center">
      {label && <span className="text-sm">{label}</span>}
      <div className="flex gap-2">
        <span className={`${titleText ? "font-bold text-lg" : ""}`}>
          {value}
        </span>
        <Button variant="ghost" size="sm" onClick={handleEditStart}>





          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EditableField;