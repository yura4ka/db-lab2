import { useState } from "react";

export const useModal = () => {
  const [modalData, setModalData] = useState(() => ({
    isOpen: false,
    text: "",
    onConfirm: () => undefined,
  }));

  const toggleModal = ({
    text,
    onConfirm,
  }: {
    text: string;
    onConfirm: () => void;
  }) => {
    setModalData({
      isOpen: true,
      text,
      onConfirm: () => {
        setModalData((prev) => ({ ...prev, isOpen: false }));
        onConfirm();
        return undefined;
      },
    });
  };

  return {
    modalProps: {
      ...modalData,
      setOpen: (open: boolean) =>
        setModalData((prev) => ({ ...prev, isOpen: open })),
    },
    toggleModal,
  };
};
