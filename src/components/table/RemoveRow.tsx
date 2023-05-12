import { TrashIcon } from "@heroicons/react/24/solid";
import { Button } from "@material-tailwind/react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  content: string;
}

export const RemoveRow: React.FC<Props> = ({ content, ...props }) => {
  return (
    <Button
      {...props}
      variant="text"
      color="red"
      className="inline-flex items-center gap-2 px-3"
    >
      <TrashIcon strokeWidth={2} className="h-5 w-5" />
      {content}
    </Button>
  );
};
