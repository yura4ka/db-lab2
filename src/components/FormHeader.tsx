import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import { Button, Typography } from "@material-tailwind/react";
import Link from "next/link";

type Props = {
  text: string;
};

const FormHeader = ({ text }: Props) => {
  return (
    <>
      <Typography variant="h4" color="blue-gray">
        {text}
      </Typography>
      <Link href="/" className="inline-block">
        <Button
          size="sm"
          variant="text"
          className="group flex items-center gap-2 px-0 pt-px hover:bg-transparent hover:text-blue-700"
        >
          На головну
          <ArrowLongRightIcon className="h-4 w-4 group-hover:text-blue-700" />
        </Button>
      </Link>
    </>
  );
};
export default FormHeader;
