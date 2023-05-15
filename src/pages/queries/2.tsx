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

const Query2: NextPage = () => {
  const { data: categories } = api.categories.get.useQuery();

  const [category, setCategory] = useState("");

  const request = api.queries.second.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    request.mutate(category);
  };

  if (!categories) return <Spinner className="h-12 w-12" />;

  return (
    <>
      <Head>
        <title>Запит 2</title>
      </Head>
      <MainHeader>Запит 2</MainHeader>

      <div>
        <Typography variant="h4" className="font-normal" color="blue-gray">
          Знайти користувачів у яких улюблені ресторани складаються з тих, що
          мають категорію X.
        </Typography>
        <form
          onSubmit={handleSubmit}
          className="mx-auto my-4 grid w-80 max-w-screen-lg gap-4 sm:w-96"
        >
          <Select
            size="lg"
            label="Категорія"
            value={category}
            onChange={(value) => setCategory(value || "")}
          >
            {(categories || []).map((c) => (
              <Option key={c.id} value={c.name}>
                {c.name}
              </Option>
            ))}
          </Select>
          <Button type="submit" fullWidth={true} disabled={category === ""}>
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
                    <HeadCell>ПІБ</HeadCell>
                    <HeadCell>Електронна адреса</HeadCell>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {request.data.map((r) => (
                    <tr key={r.email}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.email}</TableCell>
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

export default Query2;
