import {
  Button,
  Card,
  Option,
  Select,
  Spinner,
  Switch,
  Typography,
} from "@material-tailwind/react";
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import CustomInput from "~/components/CustomInput";
import FormHeader from "~/components/FormHeader";
import MainHeader from "~/components/MainHeader";
import { useCustomRouter } from "~/hooks/useCustomRouter";
import { api } from "~/utils/api";
import { validString } from "~/utils/schemas";
import { z } from "zod";

const initial = {
  name: "",
  price: "" as number | string,
  description: "",
  isMain: false,
  category: { id: -1, name: "" },
  restaurant: { id: -1, name: "" },
};

const ChangeDish: NextPage = () => {
  const { id, isCreate, push, justCreated } = useCustomRouter();

  const [form, setForm] = useState(() => initial);
  const [isError, setIsError] = useState(
    () =>
      Object.fromEntries(Object.keys(initial).map((k) => [k, false])) as Record<
        keyof typeof initial,
        boolean
      >
  );

  const { data: dishes, isLoading: isDishesLoading } =
    api.dishes.get.useQuery();
  const { data: restaurants, isLoading } = api.restaurants.get.useQuery();
  const { data: categories, isLoading: isCategoriesLoading } =
    api.categories.get.useQuery();
  const createDish = api.dishes.create.useMutation();
  const updateDish = api.dishes.update.useMutation();
  const apiUtils = api.useContext();

  const setValue = (key: keyof typeof form, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setError = (key: keyof typeof isError, value: boolean) => {
    setIsError((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    return (
      +form.price > 0 &&
      form.category.id > 0 &&
      form.restaurant.id > 0 &&
      Object.values(form).every(
        (v) =>
          (typeof v === "string" && v.trim().length !== 0) ||
          typeof v !== "string"
      ) &&
      Object.values(isError).every((e) => e === false)
    );
  };

  const { isLoading: isCurrentLoading } = api.dishes.getById.useQuery(id, {
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
      price: +form.price,
      description: form.description.trim(),
      isMain: form.isMain,
      categoryId: form.category.id,
      restaurantId: form.restaurant.id,
    };

    if (isCreate)
      createDish.mutate(data, {
        onSuccess: (newId) => {
          apiUtils.dishes.get.setData(undefined, (old) =>
            old ? [...old, { id: newId, ...form, price: +form.price }] : old
          );
          setForm(initial);
          void push(`${newId}?created=true`);
        },
      });
    else
      updateDish.mutate(
        { id, ...data },
        {
          onSuccess: () => {
            apiUtils.dishes.get.setData(undefined, (old) =>
              old
                ? old.map((r) =>
                    r.id === id ? { ...r, ...form, price: +form.price } : r
                  )
                : old
            );
          },
        }
      );
  };

  if (
    (isCurrentLoading && !isCreate) ||
    isLoading ||
    isCategoriesLoading ||
    isDishesLoading ||
    !categories
  )
    return <Spinner className="h-12 w-12" />;

  console.log(form.restaurant);

  return (
    <>
      <Head>
        <title>{isCreate ? "Створити страву" : "Редагувати страву"}</title>
      </Head>
      <MainHeader>Страви</MainHeader>
      <Card color="transparent" shadow={false} className="border p-4">
        <Typography variant="small" color="green">
          {updateDish.isSuccess
            ? "Успішно змінено"
            : justCreated
            ? "Успішно створено"
            : ""}
        </Typography>
        <FormHeader text={isCreate ? "Створити страву" : "Редагувати страву"} />
        <form
          onSubmit={handleSubmit}
          className="mb-2 mt-4 w-80 max-w-screen-lg sm:w-96"
        >
          <div className="mb-2 flex flex-col gap-4">
            <Select
              size="lg"
              label="Ресторан"
              value={form.restaurant.name}
              key={form.restaurant.name}
              onChange={() => undefined}
              error={createDish.isError}
            >
              {(restaurants || []).map((r) => (
                <Option
                  key={r.id}
                  value={r.name}
                  onClick={() =>
                    setValue("restaurant", { id: r.id, name: r.name })
                  }
                >
                  {r.name}
                </Option>
              ))}
            </Select>
            <Select
              size="lg"
              label="Категорія"
              value={form.category.name}
              onChange={() => undefined}
              error={createDish.isError}
            >
              {categories.map((c) => (
                <Option
                  key={c.id}
                  value={c.name}
                  onClick={() =>
                    setValue("category", { id: c.id, name: c.name })
                  }
                >
                  {c.name}
                </Option>
              ))}
            </Select>
            <CustomInput
              label="Назва"
              value={form.name}
              onChange={(e) => setValue("name", e.target.value)}
              validationSchema={validString}
              validationFunction={(value) =>
                (dishes || []).some(
                  (d) =>
                    d.restaurant.id === form.restaurant.id &&
                    d.name === value &&
                    d.id !== id
                )
                  ? "В цьому ресторані вже є страва з такою назвою"
                  : true
              }
              onValidation={(result) => setError("name", result)}
              isError={createDish.isError}
            />
            <CustomInput
              label="Опис"
              value={form.description}
              onChange={(e) => setValue("description", e.target.value)}
              validationSchema={validString}
              onValidation={(result) => setError("description", result)}
              isError={createDish.isError}
            />
            <CustomInput
              label="Ціна"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setValue("price", e.target.value)}
              validationSchema={z.coerce.number().positive()}
              onValidation={(result) => setError("price", result)}
              isError={createDish.isError}
            />
          </div>
          <div className="my-2">
            <Switch
              label="Головна страва"
              checked={form.isMain}
              onChange={(e) => setValue("isMain", e.target.checked)}
            />
          </div>
          <Button
            type="submit"
            fullWidth={true}
            disabled={createDish.isLoading || !validateForm()}
          >
            {isCreate ? "Створити" : "Редагувати"}
          </Button>
        </form>
      </Card>
    </>
  );
};
export default ChangeDish;
