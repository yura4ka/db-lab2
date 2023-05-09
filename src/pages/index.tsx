import { Typography } from "@material-tailwind/react";
import { type NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>RestaurantsDB</title>
      </Head>
      <Typography variant="h1" color="blue" textGradient>
        Hello
      </Typography>
    </>
  );
};

export default Home;
