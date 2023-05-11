import { Typography } from "@material-tailwind/react";

type Props = {
  children: React.ReactNode;
};

export const HeadCell = ({ children }: Props) => {
  return (
    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
      <Typography
        variant="small"
        color="blue-gray"
        className="font-normal leading-none opacity-70"
      >
        {children}
      </Typography>
    </th>
  );
};
