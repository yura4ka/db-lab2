import { PlusIcon } from "@heroicons/react/24/solid";
import { IconButton, Rating, Typography } from "@material-tailwind/react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import MainHeader from "~/components/MainHeader";
import { useModal } from "~/components/modal";
import ConfirmModal from "~/components/modal/ConfirmModal";
import { CurrencyDollarIcon as Rated } from "@heroicons/react/24/solid";
import { CurrencyDollarIcon as Unrated } from "@heroicons/react/24/outline";
import {
  EditRow,
  HeadCell,
  RemoveRow,
  Table,
  TableCell,
} from "~/components/table";
import { api } from "~/utils/api";

const Restaurants: NextPage = () => {
  const { data: restaurants } = api.restaurants.get.useQuery();
  const removeRestaurant = api.restaurants.remove.useMutation();
  const apiUtils = api.useContext();

  const { modalProps, toggleModal } = useModal();

  const handleRemove = (id: number) => {
    removeRestaurant.mutate(id, {
      onSuccess: () => {
        apiUtils.restaurants.get.setData(undefined, (old) =>
          old ? old.filter((r) => r.id !== id) : old
        );
      },
    });
  };

  return (
    <>
      <Head>
        <title>Ресторани</title>
      </Head>
      <MainHeader>
        Ресторани
        <Link href="restaurants/create" className="flex items-center">
          <IconButton variant="gradient" ripple={true}>
            <PlusIcon className="h-6 w-6" />
          </IconButton>
        </Link>
      </MainHeader>
      <Table>
        <thead>
          <tr>
            <HeadCell>Назва</HeadCell>
            <HeadCell>Адреса</HeadCell>
            <HeadCell>Сайт</HeadCell>
            <HeadCell>Опис</HeadCell>
            <HeadCell>Ціна</HeadCell>
            <HeadCell>Категорії</HeadCell>
            <HeadCell>Кількість страв</HeadCell>
            <HeadCell>Кількість відгуків</HeadCell>
            <HeadCell>Кількість лайків</HeadCell>
            <HeadCell>Дії</HeadCell>
          </tr>
        </thead>
        <tbody className="divide-y">
          {(restaurants || []).map((r) => (
            <tr key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.address}</TableCell>
              <TableCell>
                <Typography color="blue" className="hover:text-blue-700">
                  <a href={r.website}>Відкрити</a>
                </Typography>
              </TableCell>
              <TableCell className="max-w-md">
                <p className="line-clamp-3">{r.description}</p>
              </TableCell>
              <TableCell>
                <Rating
                  value={r.price}
                  readonly={true}
                  ratedColor="green"
                  ratedIcon={<Rated className="h-6 w-6" />}
                  unratedIcon={<Unrated className="h-6 w-6" />}
                />
              </TableCell>
              <TableCell>{r.categories.join(", ")}</TableCell>
              <TableCell>{r.dishCount}</TableCell>
              <TableCell>{r.reviewCount}</TableCell>
              <TableCell>{r.likedCount}</TableCell>
              <TableCell>
                <EditRow href={`restaurants/${r.id}`} content="Редагувати" />
                <RemoveRow
                  content="Видалити"
                  onClick={() =>
                    toggleModal({
                      text: `видалити ресторан ${r.name}`,
                      onConfirm: () => handleRemove(r.id),
                    })
                  }
                />
              </TableCell>
            </tr>
          ))}
        </tbody>
      </Table>
      <ConfirmModal {...modalProps} />
    </>
  );
};

export default Restaurants;
