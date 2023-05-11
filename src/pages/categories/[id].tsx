import { Button, Card, Typography } from "@material-tailwind/react";
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import CustomInput from "~/components/CustomInput";
import FormHeader from "~/components/FormHeader";
import MainHeader from "~/components/MainHeader";
import { useCustomRouter } from "~/hooks/useCustomRouter";
import { api } from "~/utils/api";
import { validString } from "~/utils/schemas";

const ChangeCategory: NextPage = () => {
  const { id, isCreate, push, justCreated } = useCustomRouter();

  const [name, setName] = useState("");
  const [isError, setIsError] = useState(false);

  const { data: categories } = api.categories.get.useQuery();
  const createCategory = api.categories.create.useMutation();
  const updateCategory = api.categories.update.useMutation();
  const apiUtils = api.useContext();

  api.categories.getById.useQuery(id, {
    enabled: id > 0,
    onSuccess: (data) => setName(data[0].name),
    onError: () => void push("/"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreate)
      createCategory.mutate(name.trim(), {
        onSuccess: (data) => {
          const newId = data[0].id;
          apiUtils.categories.get.setData(undefined, (old) =>
            old ? [...old, { id: newId, name: name.trim() }] : old
          );
          setName("");
          void push(`${newId}?created=true`);
        },
      });
    else
      updateCategory.mutate(
        { id, name: name.trim() },
        {
          onSuccess: () => {
            apiUtils.categories.get.setData(undefined, (old) =>
              old
                ? old.map((c) =>
                    c.id === id ? { ...c, name: name.trim() } : c
                  )
                : old
            );
          },
        }
      );
  };

  return (
    <>
      <Head>
        <title>
          {isCreate ? "Створити категорію" : "Редагувати категорію"}
        </title>
      </Head>
      <MainHeader>Категорії</MainHeader>
      <Card color="transparent" shadow={false} className="border p-4">
        <Typography variant="small" color="green">
          {updateCategory.isSuccess
            ? "Успішно змінено"
            : justCreated
            ? "Успішно створено"
            : ""}
        </Typography>
        <FormHeader
          text={isCreate ? "Створити категорію" : "Редагувати категорію"}
        />
        <form
          onSubmit={handleSubmit}
          className="mb-2 mt-4 w-80 max-w-screen-lg sm:w-96"
        >
          <div className="mb-2 flex flex-col gap-6">
            <CustomInput
              label="Назва"
              value={name}
              onChange={(e) => setName(e.target.value)}
              validationSchema={validString}
              validationFunction={(value) =>
                (categories || []).some((c) => c.name === value && c.id !== id)
                  ? "Категорія з такою назвою вже існує"
                  : true
              }
              onValidation={setIsError}
              isError={createCategory.isError}
            />
          </div>

          <Button
            type="submit"
            fullWidth={true}
            disabled={
              isError || name.trim().length === 0 || createCategory.isLoading
            }
          >
            {isCreate ? "Створити" : "Редагувати"}
          </Button>
        </form>
      </Card>
    </>
  );
};
export default ChangeCategory;
