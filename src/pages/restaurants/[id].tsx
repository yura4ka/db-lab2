import { type NextPage } from "next";
import Head from "next/head";
import { useCustomRouter } from "~/hooks/useCustomRouter";

const Restaurant: NextPage = () => {
  const { id, isCreate } = useCustomRouter();

  return (
    <>
      <Head>
        <title>Ресторан</title>
      </Head>
    </>
  );
};
export default Restaurant;
