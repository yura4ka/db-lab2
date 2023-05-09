import { Typography } from "@material-tailwind/react";
import Link from "next/link";

type Props = {
  label: string;
  links: { text: string; href: string }[];
};

const HomeCard = ({ label, links }: Props) => {
  return (
    <div className="w-[18rem] rounded border">
      <Typography
        variant="h4"
        className="rounded-t border-b bg-gray-50 px-5 py-2.5"
      >
        {label}
      </Typography>
      <ul className="divide-y text-xl">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="block px-2 py-2 hover:bg-gray-50">
              {l.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomeCard;
