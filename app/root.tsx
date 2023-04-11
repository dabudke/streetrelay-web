import type { LinksFunction, MetaFunction} from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import { Navbar } from "./components/navbar";

import styles from "~/styles/main.css";

import fontawesome from "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import faRegular from "@fortawesome/fontawesome-free/css/regular.min.css";
import faSolid from "@fortawesome/fontawesome-free/css/solid.min.css";
import faBrands from "@fortawesome/fontawesome-free/css/brands.min.css";

export const meta: MetaFunction = () => ({
  title: "StreetRelay",
});

export const links: LinksFunction = () => ([
  { rel: "icon", href: "/favicon.png", type: "image/png"},
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: fontawesome },
  { rel: "stylesheet", href: faSolid },
  { rel: "stylesheet", href: faRegular },
  { rel: "stylesheet", href: faBrands },
]);

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en">
        <head>
          <meta name="title" content={`${error.status} ${error.statusText} - StreetRelay`} />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Links />
        </head>
        <body className="bg-white dark:bg-stone-950">
          <Navbar />
          <div className="flex flex-col justify-center align-center w-auto py-12 mx-28 mt-5 bg-gradient-to-br from-stone-400 to-stone-700 dark:from-stone-500 dark:to-stone-800 rounded-2xl">
            <h1 className="text-[12rem] mx-auto text-stone-200 dark:text-stone-300">{error.status}</h1>
            <p className="text-3xl mx-auto text-stone-100 dark:text-stone-200">{error.statusText}</p>
            <p className="mt-3 mx-auto text-stone-50">Check the spelling in the URL, or try going to the homepage. If you still get this, try again later.</p>
          </div>
          <LiveReload />
        </body>
      </html>
    );
  } else if (error instanceof Error) {
    return (
      <html lang="en">
        <head>
          <meta name="title" content='500 Internal Server Error - StreetRelay' />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Links />
        </head>
        <body className="bg-white dark:bg-stone-950">
          <Navbar />
          <div className="flex flex-col justify-center align-center w-auto py-12 mx-28 mt-5 bg-gradient-to-br from-stone-400 to-stone-700 dark:from-stone-500 dark:to-stone-800 rounded-2xl">
            <h1 className="text-[12rem] mx-auto text-stone-200 dark:text-stone-300">500</h1>
            <p className="text-3xl mx-auto text-stone-100 dark:text-stone-200">Internal Server Error</p>
            <p className="mt-3 mx-auto text-stone-50">Something went wrong internally, try again later.</p>
          </div>
          <LiveReload />
        </body>
      </html>
    );
  } else {
    return (
      <html lang="en">
        <head>
          <meta name="title" content="Unknown Error - StreetRelay" />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Links />
        </head>
        <body className="bg-white dark:bg-stone-950">
          <Navbar />
          <div className="flex flex-col justify-center align-center w-auto py-12 mx-28 mt-5 bg-gradient-to-br from-stone-400 to-stone-700 dark:from-stone-500 dark:to-stone-800 rounded-2xl">
            <h1 className="text-3xl mx-auto mb-2 text-stone-100">Something went wrong.</h1>
            <p className="text-2xl mx-auto text-stone-100">Try again later.</p>
          </div>
          <LiveReload />
        </body>
      </html>
    );
  }
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Links />
      </head>
      <body className="bg-white dark:bg-stone-950">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
