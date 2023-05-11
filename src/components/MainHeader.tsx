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
      className="pb-8 text-center"
    >
      {children}
    </Typography>
  );
};
export default MainHeader;
