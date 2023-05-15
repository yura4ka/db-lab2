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
import CustomInput from "~/components/CustomInput";
import MainHeader from "~/components/MainHeader";
import { HeadCell, Table, TableCell } from "~/components/table";
import { api } from "~/utils/api";

const Query1: NextPage = () => {
  const { data: categories } = api.categories.get.useQuery();

  const [category, setCategory] = useState("");
  const [score, setScore] = useState(0);

  const request = api.queries.first.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    request.mutate({ category, score });
  };

  if (!categories) return <Spinner className="h-12 w-12" />;

  return (
    <>
      <Head>
        <title>Запит 1</title>
      </Head>
      <MainHeader>Запит 1</MainHeader>

      <div>
        <Typography variant="h4" className="font-normal" color="blue-gray">
          Знайти назви тих ресторанів, у яких середня оцінка страв з категорії X
          більша ніж Y.
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
          <CustomInput
            type="number"
            label="Середня оцінка"
            value={score}
            onChange={(e) => setScore(e.target.valueAsNumber || 0)}
            min={0}
          />
          <Button
            type="submit"
            fullWidth={true}
            disabled={category === "" || score === 0}
          >
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

export default Query1;
