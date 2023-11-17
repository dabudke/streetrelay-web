<script lang="ts">
  import type { ActionData, PageData, Snapshot } from "./$types";
  import Fa from "svelte-fa";
  import {
    faKey,
    faUser,
    faUserCircle,
    faWarning,
  } from "@fortawesome/free-solid-svg-icons";

  export let data: PageData;

  export let form: ActionData;

  export const snapshot: Snapshot<{ username: string }> = {
    capture: () => ({ username: usernameOrEmail }),
    restore: (data) => {
      usernameOrEmail = data.username;
    },
  };

  let usernameOrEmail: string = form?.username ?? data.username ?? "";
</script>

<svelte:head>
  <title>Login | StreetRelay</title>
</svelte:head>

{#if data.error}
  <div class="error">
    <span class="icon-wrapper"><Fa icon={faWarning} /></span>
    {#if data.error == "expired"}
      <p>Session expired, please log in again.</p>
    {:else if data.error == "invalid"}
      <p>Invalid session, please log in again.</p>
    {/if}
  </div>
{/if}

<h1>Welcome Back to StreetRelay!</h1>
<p>To continue, please log in.</p>

<label class:error={form?.error.usernameOrEmail}>
  <Fa icon={faUserCircle} />
  <input
    type="text"
    name="usernameOrEmail"
    autocomplete="username"
    placeholder="Username or Email"
    bind:value={usernameOrEmail}
    on:change={() => {
      if (form !== null) form.error.usernameOrEmail = null;
    }}
  />
</label>
{#if form?.error.usernameOrEmail}
  <p class="hint error">{form?.error.usernameOrEmail}</p>
{:else}<br />{/if}

<label class:error={form?.error.password}>
  <Fa icon={faKey} />
  <input
    type="password"
    name="password"
    autocomplete="current-password"
    placeholder="Password"
    on:change={() => {
      if (form !== null) form.error.password = null;
    }}
  />
</label>
{#if form?.error.password}
  <p class="hint error">{form?.error.password}</p>
{:else}<br />{/if}

<button type="submit">Login</button>
<p style="margin-bottom: 0">
  Not a member yet? <a href="/get-started">Get started here</a>
</p>

<style>
  label {
    background: var(--secondary);
    border-radius: 0.3rem;
    width: 100%;
    padding: 0.5rem 0.7rem;
    display: flex;
    align-content: center;
    transition: background 100ms ease-out, box-shadow 100ms ease-out,
      outline-color 100ms ease-out;
    outline: solid 0.1rem transparent;
    height: 2.5rem;
  }
  label.error {
    background: color-mix(in srgb, var(--error), var(--background) 75%);
  }
  label:hover {
    box-shadow: 0 3px 10px -2px rgba(0, 0, 0, 0.4);
  }
  label:focus-within {
    background: transparent;
    box-shadow: none;
    outline-color: var(--primary);
  }
  label.error:focus-within {
    outline-color: var(--error);
  }
  label :global(*),
  label input::placeholder {
    color: color-mix(in srgb, var(--text), var(--background) 30%);
    margin: auto 0;
    transition: color 100ms ease-out;
  }
  label.error :global(*),
  label.error input::placeholder {
    color: color-mix(in srgb, var(--error), var(--on-secondary) 75%);
  }
  label:focus-within :global(*) {
    color: var(--text);
  }

  input {
    background: transparent;
    border: none;
    margin-left: 0.6rem;
    outline: none;
    flex-grow: 1;
  }

  button {
    border-radius: 0.3rem;
    transition: background 100ms ease-out, color 100ms ease-out;
    background: var(--primary);
    color: var(--on-primary);
    border: none;
    width: 100%;
    height: 2.5rem;
  }
  button:hover {
    background: color-mix(in srgb, var(--primary), var(--on-primary) 20%);
  }

  div.error {
    display: flex;
    justify-content: center;
    background: var(--error);
    width: fit-content;
    padding: 1rem 1rem;
    border-radius: 0.8rem;
    color: var(--on-error);
    width: 100%;
    margin-bottom: 1rem;
  }
  div.error * {
    margin: auto;
    display: block;
    color: var(--on-error);
  }
  .icon-wrapper {
    margin-top: 0.06rem;
  }
  .error *:last-child {
    margin-left: 0.3rem;
  }

  .hint {
    display: block;
    margin: 0.3rem 0.3rem 0.8rem;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .hint.error {
    color: color-mix(in srgb, var(--text), var(--error) 60%);
  }
</style>
