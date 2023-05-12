import {
  Button,
  Card,
  Rating,
  Spinner,
  Textarea,
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
import { validString, validUrl } from "~/utils/schemas";
import { CurrencyDollarIcon as Rated } from "@heroicons/react/24/solid";
import { CurrencyDollarIcon as Unrated } from "@heroicons/react/24/outline";
import Multiselect from "multiselect-react-dropdown";
import type { Category } from "@prisma/client";

const initialRestaurant = {
  name: "",
  address: "",
  website: "",
  description: "",
  price: 0,
  categories: [] as Category[],
};

const ChangeRestaurant: NextPage = () => {
  const { id, isCreate, push, justCreated } = useCustomRouter();

  const [form, setForm] = useState(() => initialRestaurant);
  const [isError, setIsError] = useState(
    () =>
      Object.fromEntries(
        Object.keys(initialRestaurant).map((k) => [k, false])
      ) as Record<keyof typeof initialRestaurant, boolean>
  );

  const { data: restaurants, isLoading } = api.restaurants.get.useQuery();
  const { data: categories, isLoading: isCategoriesLoading } =
    api.categories.get.useQuery();
  const createRestaurant = api.restaurants.create.useMutation();
  const updateRestaurant = api.restaurants.update.useMutation();
  const apiUtils = api.useContext();

  const setValue = (key: keyof typeof form, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setError = (key: keyof typeof isError, value: boolean) => {
    setIsError((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    return (
      form.price > 0 &&
      form.price <= 5 &&
      form.categories.length > 0 &&
      Object.values(form).every(
        (v) =>
          (typeof v === "string" && v.trim().length !== 0) ||
          typeof v !== "string"
      ) &&
      Object.values(isError).every((e) => e === false)
    );
  };

  const { isLoading: isCurrentLoading } = api.restaurants.getById.useQuery(id, {
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
      address: form.address.trim(),
      website: form.website.trim(),
      description: form.description.trim(),
      price: form.price,
      categories: form.categories.map((c) => c.id),
    };

    if (isCreate)
      createRestaurant.mutate(data, {
        onSuccess: (newId) => {
          apiUtils.restaurants.get.setData(undefined, (old) =>
            old ? [...old, { id: newId, ...data }] : old
          );
          setForm(initialRestaurant);
          void push(`${newId}?created=true`);
        },
      });
    else
      updateRestaurant.mutate(
        { id, ...data },
        {
          onSuccess: () => {
            apiUtils.restaurants.get.setData(undefined, (old) =>
              old ? old.map((r) => (r.id === id ? { ...r, ...data } : r)) : old
            );
          },
        }
      );
  };

  if (
    (isCurrentLoading && !isCreate) ||
    isLoading ||
    isCategoriesLoading ||
    !categories
  )
    return <Spinner className="h-12 w-12" />;

  return (
    <>
      <Head>
        <title>{isCreate ? "Створити ресторан" : "Редагувати ресторан"}</title>
      </Head>
      <MainHeader>Ресторани</MainHeader>
      <Card color="transparent" shadow={false} className="border p-4">
        <Typography variant="small" color="green">
          {updateRestaurant.isSuccess
            ? "Успішно змінено"
            : justCreated
            ? "Успішно створено"
            : ""}
        </Typography>
        <FormHeader
          text={isCreate ? "Створити ресторан" : "Редагувати ресторан"}
        />
        <form
          onSubmit={handleSubmit}
          className="mb-2 mt-4 w-80 max-w-screen-lg sm:w-96"
        >
          <div className="mb-2 flex flex-col gap-4">
            <CustomInput
              label="Назва"
              value={form.name}
              onChange={(e) => setValue("name", e.target.value)}
              validationSchema={validString}
              validationFunction={(value) =>
                (restaurants || []).some((r) => r.name === value && r.id !== id)
                  ? "Ресторан з такою назвою вже існує"
                  : true
              }
              onValidation={(result) => setError("name", result)}
              isError={createRestaurant.isError}
            />
            <CustomInput
              label="Адреса"
              value={form.address}
              onChange={(e) => setValue("address", e.target.value)}
              validationSchema={validString}
              onValidation={(result) => setError("address", result)}
              isError={createRestaurant.isError}
            />
            <CustomInput
              label="Сайт"
              value={form.website}
              onChange={(e) => setValue("website", e.target.value)}
              validationSchema={validUrl}
              onValidation={(result) => setError("website", result)}
              isError={createRestaurant.isError}
            />
            <Textarea
              label="Опис"
              value={form.description}
              onChange={(e) => setValue("description", e.target.value)}
              error={createRestaurant.isError}
            />
            <Multiselect
              options={categories}
              displayValue="name"
              selectedValues={form.categories}
              onSelect={(_, item: Category) =>
                setForm((prev) => ({
                  ...prev,
                  categories: [...prev.categories, item],
                }))
              }
              onRemove={(_, item: Category) =>
                setForm((prev) => ({
                  ...prev,
                  categories: prev.categories.filter((c) => c.id !== item.id),
                }))
              }
              placeholder="Категорії"
              style={{
                searchBox: {
                  borderColor: "#b0bec5",
                  padding: "0.4rem",
                  borderRadius: "0.375rem",
                },
              }}
            />
            <div className="-mt-1 flex items-center gap-2 px-1">
              <Typography color="blue-gray" className="font-medium">
                Ціновий діапазон:
              </Typography>
              <Rating
                key={form.price}
                value={form.price}
                onChange={(value) => setValue("price", value)}
                ratedColor="green"
                ratedIcon={<Rated className="h-6 w-6" />}
                unratedIcon={<Unrated className="h-6 w-6" />}
              />
            </div>
          </div>

          <Button
            type="submit"
            fullWidth={true}
            disabled={createRestaurant.isLoading || !validateForm()}
          >
            {isCreate ? "Створити" : "Редагувати"}
          </Button>
        </form>
      </Card>
    </>
  );
};
export default ChangeRestaurant;
