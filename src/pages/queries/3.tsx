import {
  Select,
  Typography,
  Option,
  Button,
  Spinner,
} from "@material-tailwind/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import MainHeader from "~/components/MainHeader";
import { HeadCell, Table, TableCell } from "~/components/table";
import { api } from "~/utils/api";

const Query3: NextPage = () => {
  const { data: restaurants } = api.restaurants.get.useQuery();

  const [restaurant, setRestaurant] = useState("");

  const request = api.queries.third.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    request.mutate(restaurant);
  };

  if (!restaurants) return <Spinner className="h-12 w-12" />;

  return (
    <>
      <Head>
        <title>Запит 3</title>
      </Head>
      <MainHeader>Запит 3</MainHeader>

      <div>
        <Typography variant="h4" className="font-normal" color="blue-gray">
          Знайти назви тих ресторанів, що мають принаймні ті ж категорії, що й
          ресторан з назвою X.
        </Typography>
        <form
          onSubmit={handleSubmit}
          className="mx-auto my-4 grid w-80 max-w-screen-lg gap-4 sm:w-96"
        >
          <Select
            size="lg"
            label="Ресторан"
            value={restaurant}
            onChange={(value) => setRestaurant(value || "")}
          >
            {(restaurants || []).map((c) => (
              <Option key={c.id} value={c.name}>
                {c.name}
              </Option>
            ))}
          </Select>
          <Button type="submit" fullWidth={true} disabled={restaurant === ""}>
            Отримати
          </Button>
        </form>
        {request.isLoading ? (
          <Spinner className="h-12 w-12" />
        ) : (
          request.data && (
            <div>
              <Table>
                <thead>
                  <tr>
                    <HeadCell>Назва</HeadCell>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {request.data.map((r) => (
                    <tr key={r.name}>
                      <TableCell>{r.name}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default Query3;
