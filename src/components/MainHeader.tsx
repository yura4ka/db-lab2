import { Typography } from "@material-tailwind/react";

type Props = {
  children: React.ReactNode;
};
const MainHeader = ({ children }: Props) => {
  return (
    <Typography
      variant="h1"
      color="blue"
      textGradient
      className="flex items-center justify-center gap-6 pb-8"
    >
      {children}
    </Typography>
  );
};
export default MainHeader;
