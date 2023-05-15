import {
  Button,
  Card,
  Rating,
  Select,
  Spinner,
  Textarea,
  Typography,
  Option,
  IconButton,
} from "@material-tailwind/react";
import { type NextPage } from "next";
import Head from "next/head";
import FormHeader from "~/components/FormHeader";
import MainHeader from "~/components/MainHeader";
import { useCustomRouter } from "~/hooks/useCustomRouter";
import { api } from "~/utils/api";
import { useState } from "react";
import CustomInput from "~/components/CustomInput";
import { validString } from "~/utils/schemas";
import { TrashIcon } from "@heroicons/react/24/outline";

const initialReview = {
  text: "",
  score: 0,
  restaurant: { id: -1, name: "" },
  customer: { id: -1, name: "", email: "" },
};

type DishReview = { id: number; name: string; score: number; comment: string };

const ChangeReview: NextPage = () => {
  const { id, isCreate, push, justCreated } = useCustomRouter();

  const [form, setForm] = useState(() => initialReview);
  const [dishes, setDishes] = useState<DishReview[]>(() => []);

  const { data: restaurants } = api.restaurants.get.useQuery();
  const { data: customers } = api.users.get.useQuery();
  const { data: restaurantDishes } = api.restaurants.getDishes.useQuery(
    form.restaurant.id,
    {
      enabled: form.restaurant.id > 0,
      refetchOnWindowFocus: false,
    }
  );
  const createReview = api.reviews.create.useMutation();
  const updateReview = api.reviews.update.useMutation();
  const apiUtils = api.useContext();

  const setValue = (key: keyof typeof form, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    return (
      form.restaurant.id > 0 &&
      form.customer.id > 0 &&
      form.score > 0 &&
      form.score <= 5 &&
      Object.values(form).every(
        (v) =>
          (typeof v === "string" && v.trim().length !== 0) ||
          typeof v !== "string"
      ) &&
      dishes.every(
        (d) => d.comment.trim().length !== 0 && d.score > 0 && d.score <= 5
      )
    );
  };

  const { isLoading: isCurrentLoading } = api.reviews.getById.useQuery(id, {
    enabled: id > 0,
    onSuccess: (data) => {
      setDishes(data.dishes);
      setForm(data);
    },
    onError: () => void push("/"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      text: form.text.trim(),
      score: form.score,
      restaurantId: form.restaurant.id,
      customerId: form.customer.id,
      dishes,
    };

    if (isCreate)
      createReview.mutate(data, {
        onSuccess: (newId) => {
          setForm(initialReview);
          void apiUtils.reviews.get.invalidate(undefined);
          void push(`${newId}?created=true`);
        },
      });
    else
      updateReview.mutate(
        { id, ...data },
        {
          onSuccess: () => void apiUtils.reviews.get.invalidate(undefined),
        }
      );
  };

  const setDishesAt = (id: number, values: Partial<DishReview>) => {
    setDishes((prev) =>
      prev.map((d) => (id === d.id ? { ...d, ...values } : d))
    );
  };

  if (
    (isCurrentLoading && !isCreate) ||
    !restaurants ||
    !customers ||
    (!restaurantDishes && !isCreate)
  )
    return <Spinner className="h-12 w-12" />;

  return (
    <>
      <Head>
        <title>{isCreate ? "Створити відгук" : "Редагувати відгук"}</title>
      </Head>
      <MainHeader>Відгуки</MainHeader>
      <Card color="transparent" shadow={false} className="border p-4">
        <Typography variant="small" color="green">
          {updateReview.isSuccess
            ? "Успішно змінено"
            : justCreated
            ? "Успішно створено"
            : ""}
        </Typography>
        <FormHeader text={isCreate ? "Створити відгук" : "Редагувати відгук"} />
        <form
          onSubmit={handleSubmit}
          className="mb-2 mt-4 w-80 max-w-screen-lg sm:w-96"
        >
          <div className="mb-2 flex flex-col gap-4">
            <Select
              size="lg"
              label="Ресторан"
              value={form.restaurant.name}
              onChange={() => undefined}
              error={createReview.isError}
            >
              {restaurants.map((r) => (
                <Option
                  key={r.id}
                  value={r.name}
                  onClick={() => {
                    setDishes([]);
                    setValue("restaurant", { id: r.id, name: r.name });
                  }}
                >
                  {r.name}
                </Option>
              ))}
            </Select>
            <Select
              value={form.customer.name}
              size="lg"
              label="Відвідувач"
              onChange={() => undefined}
              error={createReview.isError}
              selected={(element) =>
                element && (
                  <p>
                    {form.customer.name} - {form.customer.email}
                  </p>
                )
              }
            >
              {customers.map((c) => (
                <Option
                  key={c.id}
                  value={c.name}
                  onClick={() =>
                    setValue("customer", {
                      id: c.id,
                      name: c.name,
                      email: c.email,
                    })
                  }
                >
                  <Typography variant="paragraph">{c.name}</Typography>
                  <Typography variant="small">{c.email}</Typography>
                </Option>
              ))}
            </Select>
            <div className="-mt-1 flex items-center gap-2 px-1">
              <Typography color="blue-gray" className="font-medium">
                Оцінка
              </Typography>
              <Rating
                key={form.score}
                value={form.score}
                onChange={(value) => setValue("score", value)}
              />
            </div>
            <Textarea
              label="Відгук"
              value={form.text}
              onChange={(e) => setValue("text", e.target.value)}
              error={createReview.isError}
            />

            {form.restaurant.id > 0 && (
              <>
                <div className="-mt-1 mb-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() =>
                      setDishes((prev) => [
                        {
                          id: -(dishes.length + 1),
                          name: "",
                          comment: "",
                          score: 0,
                        },
                        ...prev,
                      ])
                    }
                  >
                    Додати Страву
                  </Button>
                </div>
                <div className="grid gap-4">
                  {dishes.map((dr, i) => (
                    <div
                      key={dr.id}
                      className="flex flex-col gap-4 rounded-md border border-blue-gray-200 p-2"
                    >
                      <div className="flex items-center justify-between border-b pb-2">
                        <Typography>Відгук на страву</Typography>
                        <IconButton
                          color="red"
                          variant="text"
                          size="sm"
                          onClick={() =>
                            setDishes((prev) =>
                              prev.filter((d) => d.id !== dr.id)
                            )
                          }
                        >
                          <TrashIcon className="h-5 w-5" />
                        </IconButton>
                      </div>
                      <Select
                        label="Страва"
                        value={dr.name}
                        onChange={() => undefined}
                        error={createReview.isError}
                      >
                        {(restaurantDishes || []).map((option) => (
                          <Option
                            key={option.id}
                            value={option.name}
                            onClick={() =>
                              setDishesAt(dr.id, {
                                id: option.id,
                                name: option.name,
                              })
                            }
                            disabled={
                              !!dishes.find(
                                (dish, j) => dish.id === option.id && i !== j
                              )
                            }
                          >
                            {option.name}
                          </Option>
                        ))}
                      </Select>
                      <div className="-mt-1 flex items-center gap-2 px-1">
                        <Typography color="blue-gray" className="font-medium">
                          Оцінка
                        </Typography>
                        <Rating
                          key={dr.score}
                          value={dr.score}
                          onChange={(value) =>
                            setDishesAt(dr.id, { score: value })
                          }
                        />
                      </div>
                      <CustomInput
                        label="Коментар"
                        value={dr.comment}
                        onChange={(e) =>
                          setDishesAt(dr.id, { comment: e.target.value })
                        }
                        validationSchema={validString.max(100)}
                        isError={createReview.isError}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <Button
            type="submit"
            fullWidth={true}
            disabled={createReview.isLoading || !validateForm()}
          >
            {isCreate ? "Створити" : "Редагувати"}
          </Button>
        </form>
      </Card>
    </>
  );
};
export default ChangeReview;
