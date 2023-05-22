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

const Query8: NextPage = () => {
  const { data: categories } = api.categories.get.useQuery();

  const [category, setCategory] = useState(() => ({ id: -1, name: "" }));
  const [score, setScore] = useState(0);

  const request = api.queries.eighth.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    request.mutate({ categoryId: category.id, score });
  };

  if (!categories) return <Spinner className="h-12 w-12" />;

  return (
    <>
      <Head>
        <title>Запит 8</title>
      </Head>
      <MainHeader>Запит 8</MainHeader>

      <div>
        <Typography variant="h4" className="font-normal" color="blue-gray">
          Знайдіть страви категорії X, у яких ресторан має середню оцінку більшу
          за Y.
        </Typography>
        <form
          onSubmit={handleSubmit}
          className="mx-auto my-4 grid w-80 max-w-screen-lg gap-4 sm:w-96"
        >
          <Select
            size="lg"
            label="Категорія"
            value={category.name}
            onChange={() => undefined}
          >
            {(categories || []).map((c) => (
              <Option
                key={c.id}
                value={c.name}
                onClick={() => setCategory({ id: c.id, name: c.name })}
              >
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
            step={0.1}
          />
          <Button
            type="submit"
            fullWidth={true}
            disabled={
              category.id <= 0 || category.name.trim() === "" || score === 0
            }
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
                    <HeadCell>Ресторан</HeadCell>
                    <HeadCell>Страва</HeadCell>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {request.data.map((r) => (
                    <tr key={r.name}>
                      <TableCell>{r.restaurant}</TableCell>
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

export default Query8;
