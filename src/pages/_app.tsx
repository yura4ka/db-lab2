import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ThemeProvider } from "@material-tailwind/react";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider>
      <main className="grid min-h-[600px] w-full place-items-center rounded-lg p-6">
        <div>
          <Component {...pageProps} />
        </div>
      </main>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
