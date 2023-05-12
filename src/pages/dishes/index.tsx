import { PlusIcon } from "@heroicons/react/24/solid";
import { Chip, IconButton } from "@material-tailwind/react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import MainHeader from "~/components/MainHeader";
import { useModal } from "~/components/modal";
import ConfirmModal from "~/components/modal/ConfirmModal";
import {
  EditRow,
  HeadCell,
  RemoveRow,
  Table,
  TableCell,
} from "~/components/table";
import { api } from "~/utils/api";

const Dishes: NextPage = () => {
  const { data: dishes } = api.dishes.get.useQuery();
  const removeDosh = api.dishes.remove.useMutation();
  const apiUtils = api.useContext();

  const { modalProps, toggleModal } = useModal();

  const handleRemove = (id: number) => {
    removeDosh.mutate(id, {
      onSuccess: () => {
        apiUtils.dishes.get.setData(undefined, (old) =>
          old ? old.filter((d) => d.id !== id) : old
        );
      },
    });
  };

  return (
    <>
      <Head>
        <title>Страви</title>
      </Head>
      <MainHeader>
        Страви
        <Link href="dishes/create" className="flex items-center">
          <IconButton variant="gradient" ripple={true}>
            <PlusIcon className="h-6 w-6" />
          </IconButton>
        </Link>
      </MainHeader>
      <Table>
        <thead>
          <tr>
            <HeadCell>Назва</HeadCell>
            <HeadCell>Ресторан</HeadCell>
            <HeadCell>Категорія</HeadCell>
            <HeadCell>Опис</HeadCell>
            <HeadCell>Ціна</HeadCell>
            <HeadCell>Особливості</HeadCell>
            <HeadCell>Дії</HeadCell>
          </tr>
        </thead>
        <tbody className="divide-y">
          {(dishes || []).map((r) => (
            <tr key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.restaurant.name}</TableCell>
              <TableCell>{r.category.name}</TableCell>
              <TableCell className="max-w-md">
                <p className="line-clamp-2">{r.description}</p>
              </TableCell>
              <TableCell>${r.price}</TableCell>
              <TableCell>
                {r.isMain && <Chip color="teal" value="Головна страва" />}
              </TableCell>
              <TableCell>
                <EditRow href={`dishes/${r.id}`} content="Редагувати" />
                <RemoveRow
                  content="Видалити"
                  onClick={() =>
                    toggleModal({
                      text: `видалити страву ${r.name}`,
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

export default Dishes;
