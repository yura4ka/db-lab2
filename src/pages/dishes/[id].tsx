import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const CreateDish: NextPage = () => {
  api.dishes.getById.useQuery(1);

  return (
    <>
      <Head>
        <title>CreateDish</title>
      </Head>
    </>
  );
};

export default CreateDish;
