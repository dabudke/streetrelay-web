<script lang="ts">
  import Fa from "svelte-fa";
  import { page } from "$app/stores";
  import {
    faArrowLeft,
    faGamepad,
    faTag,
    faUser,
    faSignOut,
    faDisplay,
  } from "@fortawesome/free-solid-svg-icons";
  import { faUser as faUserOutline } from "@fortawesome/free-regular-svg-icons";
  import type { LayoutData } from "./$types";

  export let data: LayoutData;
</script>

<form
  method="post"
  action="/logout"
  id="logout"
/>

<div class="container">
  <aside class="desktop">
    <a href="/me">
      <Fa icon={faArrowLeft} />
      My Profile
    </a>
    <div class="account">
      <img
        src={data.user.profilePicture}
        alt="Your Mii"
      />
      <div>
        <h1>{data.user.nickname}</h1>
        <p>@{data.user.id}</p>
      </div>
    </div>
    <menu>
      <li class:active={$page.url.pathname == "/me/profile"}>
        <a href="/me/profile">
          <Fa
            icon={faUser}
            fw
            size="sm"
          /> Profile</a
        >
      </li>
      <li class:active={$page.url.pathname == "/me/devices"}>
        <a href="/me/devices">
          <Fa
            fw
            size="sm"
            icon={faDisplay}
          /> Devices</a
        >
      </li>
      <li class:active={$page.url.pathname == "/me/games"}>
        <a href="/me/games"
          ><Fa
            icon={faGamepad}
            size="sm"
            fw
          /> Games</a
        >
      </li>
      <li class:active={$page.url.pathname == "/me/tags"}>
        <a href="/me/tags"
          ><Fa
            icon={faTag}
            size="sm"
            fw
          /> Tags</a
        >
      </li>
    </menu>
    <hr />
    <form
      action="/logout"
      method="post"
    >
      <button type="submit">
        <Fa
          icon={faSignOut}
          size="sm"
          fw
        />
        Log Out</button
      >
    </form>
  </aside>

  <div class="content">
    <slot />
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
  }

  aside {
    width: 20rem;
    margin-right: 2rem;
    height: 100vh;
    padding-top: 20vh;
    padding-left: 1rem;
    padding-right: 1rem;
    background-color: var(--secondary);
  }

  aside > a {
    color: var(--primary);
    transition: color 150ms ease-out;
  }
  aside > a:hover {
    color: color-mix(in srgb, var(--primary), var(--text) 30%);
  }
  aside > a :global(*) {
    color: inherit;
  }

  aside hr {
    border-color: var(--accent);
    margin: 0.5rem 0.6rem;
  }

  .account {
    margin-left: 1rem;
    margin-top: 1rem;
    display: flex;
  }
  .account img {
    height: 3.5rem;
    width: 3.5rem;
    border-radius: 1.75rem;
  }
  .account div {
    display: flex;
    flex-direction: column;
    margin-left: 0.5rem;
    justify-content: center;
  }
  .account h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  .account p {
    margin: 0;
    color: var(--accent);
  }

  menu {
    margin: 0;
    margin-top: 1rem;
    padding: 0;
  }
  menu :global(*) {
    color: inherit;
  }
  menu a {
    display: block;
    padding: 0.5rem 1rem;
    color: var(--text);
    transition:
      background 150ms ease-out,
      color 150ms ease-out;
    border-radius: 0.4rem;
  }
  menu a:hover {
    background-color: color-mix(in srgb, transparent, var(--primary) 20%);
  }
  menu li:not(:last-child) {
    margin-bottom: 0.2rem;
  }
  menu li::marker {
    content: none;
  }
  menu li.active a {
    background-color: var(--primary);
    color: var(--on-primary);
    font-weight: 600;
  }
  menu li.active a:hover {
    background-color: color-mix(in srgb, var(--primary), var(--on-primary) 10%);
  }

  button {
    color: color-mix(in srgb, var(--error), var(--text) 20%);
    background: none;
    border: none;
    border-radius: 0.4rem;
    padding: 0.5rem 1rem;
    transition:
      background 100ms ease-out,
      color 100ms ease-out;
  }
  button:hover {
    color: color-mix(in srgb, var(--error), var(--text) 30%);
    background-color: color-mix(in srgb, transparent, var(--error) 15%);
  }
  button :global(*) {
    color: inherit;
  }

  .content {
    padding-top: 8rem;
  }
</style>
