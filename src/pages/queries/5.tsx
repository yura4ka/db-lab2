import { Typography, Button, Spinner } from "@material-tailwind/react";
import type { NextPage } from "next";
import Head from "next/head";
import MainHeader from "~/components/MainHeader";
import { HeadCell, Table, TableCell } from "~/components/table";
import { api } from "~/utils/api";

const Query5: NextPage = () => {
  const request = api.queries.fifth.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    request.mutate();
  };

  return (
    <>
      <Head>
        <title>Запит 5</title>
      </Head>
      <MainHeader>Запит 5</MainHeader>

      <div>
        <Typography variant="h4" className="font-normal" color="blue-gray">
          Знайти користувачів, що поставили відгуки на страви з кожної
          категорії.
        </Typography>
        <form
          onSubmit={handleSubmit}
          className="mx-auto my-4 grid w-80 max-w-screen-lg gap-4 sm:w-96"
        >
          <Button type="submit" fullWidth={true}>
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

export default Query5;
