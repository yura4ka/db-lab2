import { Typography, Button, Spinner } from "@material-tailwind/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import CustomInput from "~/components/CustomInput";
import MainHeader from "~/components/MainHeader";
import { HeadCell, Table, TableCell } from "~/components/table";
import { api } from "~/utils/api";

const Query7: NextPage = () => {
  const [score, setScore] = useState(0);

  const request = api.queries.seventh.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    request.mutate(score);
  };

  return (
    <>
      <Head>
        <title>Запит 7</title>
      </Head>
      <MainHeader>Запит 7</MainHeader>

      <div>
        <Typography variant="h4" className="font-normal" color="blue-gray">
          Знайти користувачів, у яких середній бал відгуків менший за X.
        </Typography>
        <form
          onSubmit={handleSubmit}
          className="mx-auto my-4 grid w-80 max-w-screen-lg gap-4 sm:w-96"
        >
          <CustomInput
            type="number"
            label="Середня оцінка"
            value={score}
            onChange={(e) => setScore(e.target.valueAsNumber || 0)}
            min={0}
            step={0.1}
          />
          <Button type="submit" fullWidth={true} disabled={score === 0}>
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

export default Query7;
