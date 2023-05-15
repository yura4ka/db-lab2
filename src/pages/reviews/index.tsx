import { PlusIcon, StarIcon, PencilIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardBody,
  CardFooter,
  IconButton,
  Rating,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import MainHeader from "~/components/MainHeader";
import { api } from "~/utils/api";

const Reviews: NextPage = () => {
  const { data: reviews } = api.reviews.get.useQuery();

  if (!reviews) return <Spinner className="h-12 w-12" />;

  return (
    <>
      <Head>
        <title>Огляди</title>
      </Head>

      <MainHeader>
        Огляди
        <Link href="reviews/create" className="flex items-center">
          <IconButton variant="gradient" ripple={true}>
            <PlusIcon className="h-6 w-6" />
          </IconButton>
        </Link>
      </MainHeader>

      <div className="grid gap-10">
        {reviews.map((r) => (
          <Card key={r.id} className="w-[48rem]">
            <CardBody>
              <div className="flex items-center justify-between">
                <Typography
                  variant="h4"
                  color="blue-gray"
                  className="font-medium"
                >
                  {r.restaurant}
                </Typography>
                <Link href={`reviews/${r.id}`}>
                  <IconButton size="sm" variant="text">
                    <PencilIcon className="h-4 w-4" />
                  </IconButton>
                </Link>
              </div>
              <Rating value={r.score} readonly={true} className="mb-3 mt-1" />
              <Typography color="gray">{r.text}</Typography>

              {r.dishes.length !== 0 && (
                <>
                  <Typography
                    variant="h5"
                    color="blue-gray"
                    className="my-3 font-medium"
                  >
                    Вказані страви
                  </Typography>
                  <div className="flex gap-6 overflow-x-auto px-1">
                    {r.dishes.map((d) => (
                      <div
                        key={d.name}
                        className="my-1 min-w-[10rem] max-w-[18rem] rounded-md p-4 shadow"
                      >
                        <div className="mb-2 flex justify-between gap-4">
                          <Typography
                            variant="h5"
                            color="blue-gray"
                            className="font-medium"
                          >
                            {d.name}
                          </Typography>
                          <div className="flex items-center gap-px">
                            <StarIcon className="h-5 w-5 text-yellow-700" />
                            {d.score}
                          </div>
                        </div>
                        <Typography color="gray">{d.comment}</Typography>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardBody>
            <CardFooter className="flex items-center justify-between">
              <Typography className="font-normal">{r.customer}</Typography>
              <Typography className="font-normal">
                {new Intl.DateTimeFormat().format(r.createdAt)}
              </Typography>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};

export default Reviews;
