import { Fragment } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

type Props = {
  text: string;
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  text,
  isOpen,
  setOpen,
  onConfirm,
}: Props) {
  return (
    <Fragment>
      <Dialog open={isOpen} handler={() => setOpen(true)} size="xs">
        <DialogHeader>Підтвердьте дію</DialogHeader>
        <DialogBody divider>
          Ви впевнені, що хочете <span className="font-bold">{text}</span>?
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setOpen(false)}
            className="mr-1"
          >
            <span>Відмінити</span>
          </Button>
          <Button variant="gradient" color="blue" onClick={onConfirm}>
            <span>Підтвердити</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </Fragment>
  );
}
