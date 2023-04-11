import type { PropsWithoutRef } from "react";

const navPaths: [ string, string, [ string, string ][]? ][] = [
  [ "Home", "/" ],
  [ "Games", "/games/", [
    [ "Hot", "/games/hot/" ],
    [ "Featured", "/games/featured/" ],
    [ "Top", "/games/top/" ],
  ] ],
  [ "Users", "/users/", [
    [ "Popular", "/users/popular/ "],
    [ "Search", "/users/?q" ],
  ]],
  [ "About", "/about/" ],
];

export function Navbar({ auth, path }: PropsWithoutRef<{ auth?: string, path?: string }>) {
  return (
    <nav className="flex content-center justify-between w-auto h-[4.8rem] my-6 mx-16 px-5 rounded-3xl text-lg text-emerald-950 bg-emerald-300 dark:text-emerald-100 dark:bg-emerald-700">
      <p className="ml-2 block italic my-auto text-2xl">Street<span className="font-bold">Relay</span></p>
      <ul className="flex flex-row my-auto space-x-2">
        { navPaths.map(([ name, url, dropdown ]) => dropdown ?
          <li key={name} className="relative" onMouseOver={() => document.getElementById(`dropdown-${name}`)?.classList.remove("hidden")} onMouseLeave={() => document.getElementById(`dropdown-${name}`)?.classList.add("hidden")}>
            <a href={url} className={`rounded-full py-1 px-3 ${url == path ? "bg-emerald-400 dark:bg-emerald-600" : "bg-transparent hover:bg-emerald-400 dark:hover:bg-emerald-600"}`}>
              {name}
              <i className="h-[0.75em] ml-2 fa-solid fa-caret-down fa-xs" />
            </a>
            <ul id={`dropdown-${name}`} className="hidden absolute flex flex-col py-2 rounded-md top-7 w-36 bg-emerald-500 text-emerald-50 dark:text-emerald-950">
              { dropdown.map(([ name, url ]) => 
                <li key={name}><a href={url} className="block min-w-full py-1.5 pl-4 pr-auto hover:bg-emerald-800 hover:text-emerald-50">{name}</a></li>
              )}
            </ul>
          </li> :
          <li key={name}><a href={url} className={`rounded-full py-1 px-3 ${url == path ? "bg-emerald-400 dark:bg-emerald-600" : "bg-transparent hover:bg-emerald-400 dark:hover:bg-emerald-600"}`}>{name}</a></li>
        ) }
      </ul>
      <div className="flex flex-row content-baseline text-md my-auto space-x-1">
        <a className="py-2 px-3 rounded-lg border-2 text-emerald-800 border-emerald-700 hover:text-emerald-50 hover:bg-emerald-700 dark:text-emerald-200 dark:border-emerald-200 dark:hover:text-emerald-900 dark:hover:bg-emerald-200" href="/login/">Login</a>
        <a className="py-2 px-3 rounded-lg text-medium text-emerald-50 bg-emerald-600 hover:text-white hover:bg-emerald-500 dark:text-emerald-950 dark:text-bold dark:bg-emerald-400 dark:hover:text-emerald-900 dark:hover:bg-emerald-300" href="/start/">Get Started</a>
      </div>
    </nav>
  );
}