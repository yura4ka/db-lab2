import { Button, Card, Spinner, Typography } from "@material-tailwind/react";
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import CustomInput from "~/components/CustomInput";
import FormHeader from "~/components/FormHeader";
import MainHeader from "~/components/MainHeader";
import { useCustomRouter } from "~/hooks/useCustomRouter";
import { api } from "~/utils/api";
import { validEmail, validString } from "~/utils/schemas";

const initialUser = {
  name: "",
  email: "",
};

const ChangeUser: NextPage = () => {
  const { id, isCreate, push, justCreated } = useCustomRouter();

  const [form, setForm] = useState(() => initialUser);
  const [isError, setIsError] = useState(
    () =>
      Object.fromEntries(
        Object.keys(initialUser).map((k) => [k, false])
      ) as Record<keyof typeof initialUser, boolean>
  );

  const { data: users, isLoading } = api.users.get.useQuery();
  const createUser = api.users.create.useMutation();
  const updateUser = api.users.update.useMutation();
  const apiUtils = api.useContext();

  const setValue = (key: keyof typeof form, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setError = (key: keyof typeof isError, value: boolean) => {
    setIsError((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    return (
      Object.values(form).every(
        (v) =>
          (typeof v === "string" && v.trim().length !== 0) ||
          typeof v !== "string"
      ) && Object.values(isError).every((e) => e === false)
    );
  };

  const { isLoading: isCurrentLoading } = api.users.getById.useQuery(id, {
    enabled: id > 0,
    onSuccess: (data) => {
      setForm(data);
    },
    onError: () => void push("/"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: form.name.trim(),
      email: form.email.trim(),
    };

    if (isCreate)
      createUser.mutate(data, {
        onSuccess: (newId) => {
          apiUtils.users.get.setData(undefined, (old) =>
            old
              ? [
                  ...old,
                  { id: newId, ...data, favoriteCount: 0, reviewCount: 0 },
                ]
              : old
          );
          setForm(initialUser);
          void push(`${newId}?created=true`);
        },
      });
    else
      updateUser.mutate(
        { id, ...data },
        {
          onSuccess: () => {
            apiUtils.users.get.setData(undefined, (old) =>
              old ? old.map((u) => (u.id === id ? { ...u, ...data } : u)) : old
            );
          },
        }
      );
  };

  if ((isCurrentLoading && !isCreate) || isLoading)
    return <Spinner className="h-12 w-12" />;

  return (
    <>
      <Head>
        <title>
          {isCreate ? "Створити користувача" : "Редагувати користувача"}
        </title>
      </Head>
      <MainHeader>Користувачі</MainHeader>
      <Card color="transparent" shadow={false} className="border p-4">
        <Typography variant="small" color="green">
          {updateUser.isSuccess
            ? "Успішно змінено"
            : justCreated
            ? "Успішно створено"
            : ""}
        </Typography>
        <FormHeader
          text={isCreate ? "Створити користувача" : "Редагувати користувача"}
        />
        <form
          onSubmit={handleSubmit}
          className="mb-2 mt-4 w-80 max-w-screen-lg sm:w-96"
        >
          <div className="mb-2 flex flex-col gap-4">
            <CustomInput
              label="ПІБ"
              value={form.name}
              onChange={(e) => setValue("name", e.target.value)}
              validationSchema={validString}
              onValidation={(result) => setError("name", result)}
              isError={createUser.isError}
            />
            <CustomInput
              label="Електронна Адреса"
              value={form.email}
              onChange={(e) => setValue("email", e.target.value)}
              validationSchema={validEmail}
              onValidation={(result) => setError("email", result)}
              validationFunction={(value) =>
                (users || []).some((u) => u.email === value && u.id !== id)
                  ? "Користувач з такою електронною адресою вже існує"
                  : true
              }
              isError={createUser.isError}
            />
          </div>

          <Button
            type="submit"
            fullWidth={true}
            disabled={createUser.isLoading || !validateForm()}
          >
            {isCreate ? "Створити" : "Редагувати"}
          </Button>
        </form>
      </Card>
    </>
  );
};
export default ChangeUser;
