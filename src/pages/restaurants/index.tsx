import { Typography } from "@material-tailwind/react";
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const Restaurants: NextPage = () => {
  const { data: restaurants } = api.restaurants.get.useQuery();
  const TABLE_HEAD: string[] = [];

  return (
    <>
      <Head>
        <title>Ресторани</title>
      </Head>
      <Typography
        variant="h1"
        color="blue"
        textGradient
        className="pb-8 text-center"
      >
        Ресторани
      </Typography>
      <table className="w-full min-w-max table-auto text-left">
        <thead>
          <tr>
            {TABLE_HEAD.map((head) => (
              <th
                key={head}
                className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
              >
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal leading-none opacity-70"
                >
                  {head}
                </Typography>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(restaurants || []).map((r) => (
            <tr key={r.id}>
              <td className="pb-4">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal"
                >
                  {r.name}
                </Typography>
              </td>
              <td className="pb-4">
                <Typography
                  href="#"
                  variant="small"
                  color="blue"
                  className="font-medium"
                >
                  Edit
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
export default Restaurants;
