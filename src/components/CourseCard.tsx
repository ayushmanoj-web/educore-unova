
import { Progress } from "@/components/ui/progress";

interface CourseCardProps {
  title: string;
  description: string;
  progress?: number;
  onStart?: () => void;
}

const CourseCard = ({
  title,
  description,
  progress = 0,
  onStart,
}: CourseCardProps) => (
  <div className="bg-white rounded-xl shadow-md p-6 border flex flex-col gap-3 transition-transform hover:scale-105 hover:shadow-lg animate-fade-in">
    <h3 className="font-semibold text-lg text-blue-800">{title}</h3>
    <p className="text-slate-600 text-sm">{description}</p>
    <div>
      <Progress value={progress} className="h-2 my-2 rounded" />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Progress</span>
        <span className="text-xs">{progress}%</span>
      </div>
    </div>
    <button
      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
      onClick={onStart}
    >
      Start
    </button>
  </div>
);

export default CourseCard;
