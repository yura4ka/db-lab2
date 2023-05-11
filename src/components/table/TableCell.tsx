import { Typography } from "@material-tailwind/react";

type Props = {
  children: React.ReactNode;
};

export const TableCell = ({ children }: Props) => {
  return (
    <td className="p-4">
      <Typography color="blue-gray" className="font-normal">
        {children}
      </Typography>
    </td>
  );
};
