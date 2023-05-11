import { useRouter } from "next/router";

export const useCustomRouter = () => {
  const router = useRouter();
  const query = router.query.id || -1;
  const isCreate = query === "create";
  const id = isCreate ? -1 : +query || -1;
  const justCreated = router.query.created || false;

  return { ...router, isCreate, id, justCreated };
};
