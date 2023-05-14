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

const Customers: NextPage = () => {
  const { data: users } = api.users.get.useQuery();
  const removeUser = api.users.remove.useMutation();
  const apiUtils = api.useContext();

  const { modalProps, toggleModal } = useModal();

  const handleRemove = (id: number) => {
    removeUser.mutate(id, {
      onSuccess: () => {
        apiUtils.users.get.setData(undefined, (old) =>
          old ? old.filter((c) => c.id !== id) : old
        );
      },
    });
  };

  return (
    <>
      <Head>
        <title>Користувачі</title>
      </Head>
      <MainHeader>
        Користувачі
        <Link href="users/create" className="flex items-center">
          <IconButton variant="gradient" ripple={true}>
            <PlusIcon className="h-6 w-6" />
          </IconButton>
        </Link>
      </MainHeader>
      <Table>
        <thead>
          <tr>
            <HeadCell>ПІБ</HeadCell>
            <HeadCell>Електронна адреса</HeadCell>
            <HeadCell>Улюблені ресторани</HeadCell>
            <HeadCell>Кількість відгуків</HeadCell>
            <HeadCell>Дії</HeadCell>
          </tr>
        </thead>
        <tbody className="divide-y">
          {(users || []).map((r) => (
            <tr key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>
                <a href={`mailto:${r.email}`}>{r.email}</a>
              </TableCell>
              <TableCell>{r.favoriteCount}</TableCell>
              <TableCell>{r.reviewCount}</TableCell>
              <TableCell>
                <EditRow href={`users/${r.id}`} content="Редагувати" />
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

export default Customers;
