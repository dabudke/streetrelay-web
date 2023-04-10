import type { LinksFunction, MetaFunction } from "@remix-run/node";
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

import styles from "~/styles/main.css";

import fontawesome from "~/styles/fontawesome/css/fontawesome.min.css";
import faSolid from "~/styles/fontawesome/css/solid.min.css";
import faRegular from "~/styles/fontawesome/css/regular.min.css";
import faBrands from "~/styles/fontawesome/css/brands.min.css";

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
          <Meta />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width;initial-scale=1" />
          <Links />
          <script src="https://kit.fontawesome.com/1ef4e3c534.js" crossOrigin="anonymous" />
        </head>
        <body>
          {/* <Hero>
            <Hero.Body>
              <Heading>{error.status}</Heading>
              <Heading subtitle>{error.statusText}</Heading>
            </Hero.Body>
          </Hero> */}
        </body>
      </html>
    );
  } else if (error instanceof Error) {
    return (
      <html lang="en">
        <head>
          <Meta />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width;initial-scale=1" />
          <Links />
          <script src="https://kit.fontawesome.com/1ef4e3c534.js" crossOrigin="anonymous" />
        </head>
        <body>
          {/* <Hero>
            <Hero.Body>
              <Heading>An error occoured</Heading>
              <Heading subtitle>{error.message}</Heading>
            </Hero.Body>
          </Hero> */}
        </body>
      </html>
    );
  } else {
    return (
      <html lang="en">
        <head>
          
        </head>
      </html>
    )
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
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
