import { PlusIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
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

const Categories: NextPage = () => {
  const { data: categories } = api.categories.get.useQuery();
  const removeCategory = api.categories.remove.useMutation();
  const apiUtils = api.useContext();

  const { modalProps, toggleModal } = useModal();

  const handleRemove = (id: number) => {
    removeCategory.mutate(id, {
      onSuccess: () => {
        apiUtils.categories.get.setData(undefined, (old) =>
          old ? old.filter((c) => c.id !== id) : old
        );
      },
    });
  };

  return (
    <>
      <Head>
        <title>Категорії</title>
      </Head>
      <MainHeader>
        Категорії
        <Link href="categories/create" className="flex items-center">
          <IconButton variant="gradient" ripple={true}>
            <PlusIcon className="h-6 w-6" />
          </IconButton>
        </Link>
      </MainHeader>
      <Table>
        <thead>
          <tr>
            <HeadCell>Назва</HeadCell>
            <HeadCell>Дії</HeadCell>
          </tr>
        </thead>
        <tbody className="divide-y">
          {(categories || []).map((c) => (
            <tr key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>
                <EditRow href={`categories/${c.id}`} content="Редагувати" />
                <RemoveRow
                  content="Видалити"
                  onClick={() =>
                    toggleModal({
                      text: `видалити категорію ${c.name}`,
                      onConfirm: () => handleRemove(c.id),
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

export default Categories;
