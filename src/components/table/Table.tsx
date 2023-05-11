import { Card } from "@material-tailwind/react";

type Props = {
  children: React.ReactNode;
};

export const Table = ({ children }: Props) => {
  return (
    <Card className="h-full w-full overflow-auto">
      <table className="w-full min-w-[33vw] table-auto text-left">
        {children}
      </table>
    </Card>
  );
};
