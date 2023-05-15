import { TrashIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  IconButton,
  Select,
  Spinner,
  Typography,
  Option,
} from "@material-tailwind/react";
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
  likedRestaurants: [] as { id: number; name: string }[],
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
  const { data: restaurants } = api.restaurants.get.useQuery();
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
      ) &&
      Object.values(isError).every((e) => e === false) &&
      form.likedRestaurants.every((l) => l.id > 0)
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
      likedRestaurants: form.likedRestaurants.map((l) => l.id),
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

  if ((isCurrentLoading && !isCreate) || isLoading || !restaurants)
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

            <div className="-mt-1 mb-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={() =>
                  setValue("likedRestaurants", [
                    {
                      id: -(form.likedRestaurants.length + 1),
                      name: "",
                    },
                    ...form.likedRestaurants,
                  ])
                }
              >
                Додати улюблений ресторан
              </Button>
              <div className="my-4 grid gap-4">
                {form.likedRestaurants.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between gap-1"
                  >
                    <Select
                      label="Ресторан"
                      value={l.name}
                      onChange={() => undefined}
                      error={createUser.isError}
                    >
                      {restaurants.map((option) => (
                        <Option
                          key={option.id}
                          value={option.name}
                          onClick={() =>
                            setValue(
                              "likedRestaurants",
                              form.likedRestaurants.map((lr) =>
                                lr.id === l.id
                                  ? { id: option.id, name: option.name }
                                  : lr
                              )
                            )
                          }
                          disabled={
                            !!form.likedRestaurants.find(
                              (lr) => lr.id === option.id
                            )
                          }
                        >
                          {option.name}
                        </Option>
                      ))}
                    </Select>
                    <IconButton
                      color="red"
                      variant="text"
                      size="sm"
                      onClick={() =>
                        setValue(
                          "likedRestaurants",
                          form.likedRestaurants.filter((r) => l.id !== r.id)
                        )
                      }
                    >
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                ))}
              </div>
            </div>
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
