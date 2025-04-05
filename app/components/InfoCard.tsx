import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface InfoCardProps {
  title: string;
  description: string;
  showChangeButton?: boolean;
  label?: string;
  onChangeClick?: () => void;
  changeLabel?: string;
}

const InfoCard = ({
  title,
  description,
  showChangeButton,
  onChangeClick,
  label,
  changeLabel,
}: InfoCardProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mt-6 mb-1">
        {label}
        <Button variant='ghost' className="cursor-pointer" onClick={onChangeClick}>
          {changeLabel}
        </Button>
      </div>
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-24 h-20 bg-blue-50 rounded-lg flex items-center justify-center"></div>
            <div className="flex flex-col items-start">
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-gray-500 text-sm">{description}</p>
            </div>
          </div>
          {showChangeButton && (
            <Button variant="outline">Change template</Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InfoCard;
