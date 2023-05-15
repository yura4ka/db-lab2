import { Typography } from "@material-tailwind/react";
import { type NextPage } from "next";
import Head from "next/head";
import HomeCard from "~/components/HomeCard";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>RestaurantsDB</title>
      </Head>
      <Typography
        variant="h1"
        color="blue"
        textGradient
        className="pb-8 text-center"
      >
        Головна
      </Typography>

      <div className="grid grid-cols-3 gap-8">
        <HomeCard
          label="Ресторани"
          links={[
            { text: "Список", href: "restaurants" },
            { text: "Створити", href: "restaurants/create" },
          ]}
        />
        <HomeCard
          label="Страви"
          links={[
            { text: "Список", href: "dishes" },
            { text: "Створити", href: "dishes/create" },
          ]}
        />
        <HomeCard
          label="Користувачі"
          links={[
            { text: "Список", href: "users" },
            { text: "Створити", href: "users/create" },
          ]}
        />
        <HomeCard
          label="Категорії"
          links={[
            { text: "Список", href: "categories" },
            { text: "Створити", href: "categories/create" },
          ]}
        />
        <HomeCard
          label="Огляди"
          links={[
            { text: "Список", href: "reviews" },
            { text: "Створити", href: "reviews/create" },
          ]}
        />
        <HomeCard label="Запити" links={[]} />
      </div>
    </>
  );
};

export default Home;
