import { Typography } from "@material-tailwind/react";
import type { TdHTMLAttributes } from "react";

interface Props extends TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableCell = ({ children, ...props }: Props) => {
  return (
    <td {...props} className={["p-4", props.className || ""].join(" ")}>
      <Typography color="blue-gray" className="font-normal" as="div">
        {children}
      </Typography>
    </td>
  );
};
