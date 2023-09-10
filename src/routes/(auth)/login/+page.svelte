<script lang="ts">
  import type { ActionData, PageData, Snapshot } from "./$types";
  import Fa from "svelte-fa";
  import { faWarning } from "@fortawesome/free-solid-svg-icons";

  export let data: PageData;

  export let form: ActionData;

  export const snapshot: Snapshot<{ username: string }> = {
    capture: () => ({ username: userID }),
    restore: (data) => {
      userID = data.username;
    },
  };

  let userID: string = form?.username ?? data.username ?? "";
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

<form method="post">
  <label>
    User ID<br />
    <input
      class:invalid={form?.error == "missing" || form?.error == "invalid"}
      name="userid"
      type="text"
      bind:value={userID}
      autocomplete="username"
    />
    {#if form?.error == "missing"}
      <br />
      <span class="hint">Please input your user ID</span>
    {:else if form?.error == "invalid"}
      <br />
      <span class="hint">Invalid user ID</span>
    {/if}
  </label><br />
  <label>
    Password<br />
    <input
      class:invalid={form?.error == "incorrect"}
      type="password"
      name="password"
      autocomplete="current-password"
    />
    {#if form?.error == "incorrect"}
      <br />
      <span class="hint">Incorrect Password</span>
    {/if}
  </label><br />
  <a href="/getstarted{userID ? '?u=' + encodeURIComponent(userID) : ''}"
    >Sign Up</a
  >
  <button type="submit">Login</button>
</form>

<style>
  input {
    background: transparent;
    border: 0.1rem solid var(--accent);
    border-radius: 0.3rem;
    padding: 0.5rem 0.7rem;
    transition: border 200ms ease-out;
    width: 20rem;
  }
  input.invalid {
    border-color: var(--error);
  }
  input:focus {
    border-color: var(--primary);
    outline: none;
  }
  label {
    display: block;
  }

  a,
  button {
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    margin-top: 0.3rem;
  }
  a {
    background-color: var(--secondary);
    color: var(--on-secondary);
  }
  button {
    background-color: var(--primary);
    color: var(--on-primary);
    border: none;
  }

  .error {
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

  .error * {
    margin: auto;
    display: block;
  }
  .icon-wrapper {
    margin-top: 0.06rem;
  }
  .error *:last-child {
    margin-left: 0.3rem;
  }

  .hint {
    margin: 0;
    color: var(--error);
  }
</style>
