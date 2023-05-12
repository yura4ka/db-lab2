import { PencilIcon } from "@heroicons/react/24/solid";
import { Button } from "@material-tailwind/react";
import Link from "next/link";

type Props = {
  content: string;
  href: string;
};

export const EditRow = ({ content, href }: Props) => {
  return (
    <Link href={href}>
      <Button
        variant="text"
        color="blue"
        className="inline-flex items-center gap-2 px-3"
      >
        <PencilIcon strokeWidth={2} className="h-5 w-5" />
        {content}
      </Button>
    </Link>
  );
};
