<script lang="ts">
  import {
    faCheck,
    faCircle,
    faEnvelope,
    faKey,
    faUser,
    faWarning,
    faXmark,
  } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";
  import type { ActionData, PageData, Snapshot } from "./$types";

  export let data: PageData;
  export let form: ActionData;

  export const snapshot: Snapshot<{ username: string; email: string }> = {
    capture: () => ({ username, email }),
    restore: (data) => {
      username = data.username;
      email = data.email;
    },
  };

  let username: string;
  let email: string;

  let password = "";
  let passwordOK = false;
  let ignoreConfirm = true;
  let passwordGates = {
    lowercase: false,
    uppercase: false,
    symbol: false,
    number: false,
    length: false,
  };
  const passwordGateTexts: Record<string, string> = {
    lowercase: "At least 1 lowercase letter",
    uppercase: "At least 1 uppercase letter",
    symbol: "At least 1 symbol",
    number: "At least 1 number",
    length: "At least 8 characters long",
  };
  function onPasswordChange() {
    passwordGates.lowercase = !!password.match(/[a-z]/);
    passwordGates.uppercase = !!password.match(/[A-Z]/);
    passwordGates.symbol = !!password.match(/[\W_]/);
    passwordGates.number = !!password.match(/[0-9]/);
    passwordGates.length = password.length >= 8;
  }
</script>

{#if !form || !form.success}
  {#if form?.error.creation}
    <div class="error">
      <Fa icon={faWarning} />
      <p>{form.error.creation}</p>
    </div>
  {/if}

  <h1>Welcome to StreetRelay!</h1>
  <p>Create an account and join the fun!</p>
  <label class:invalid={form?.error.email}>
    <Fa icon={faEnvelope} />
    <input
      type="email"
      name="email"
      autocomplete="email"
      placeholder="Email Address"
      on:change={() => {
        if (form !== null) form.error.email = null;
      }}
    />
  </label>
  {#if form?.error.email}
    <p class="hint invalid">{form?.error.email}</p>
  {:else}<br />{/if}

  <label class:invalid={form?.error.username}>
    <Fa icon={faUser} />
    <input
      type="text"
      name="username"
      autocomplete="username"
      placeholder="Username"
      on:change={() => {
        if (form !== null) form.error.username = null;
      }}
    />
  </label>
  {#if form?.error.username}
    <p class="hint invalid">{form?.error.username}</p>
  {:else}
    <p class="hint">
      Must be 3-30 characters long, and only contain uppercase and lowercase
      letters, numbers, and underscores.
    </p>
  {/if}

  <label class:invalid={passwordOK || form?.error.password}>
    <Fa icon={faKey} />
    <input
      type="password"
      name="password"
      autocomplete="new-password"
      placeholder="Create Password"
      bind:value={password}
      on:change={() => {
        onPasswordChange();
        if (form) form.error.password = false;
        passwordOK = Object.values(passwordGates).some((v) => v === false);
      }}
      on:input={onPasswordChange}
    />
  </label>
  <p class="hint">
    {#each Object.entries(passwordGates) as [name, fulfilled]}
      <span class:not-fulfilled={!fulfilled}>
        <Fa
          icon={fulfilled ? faCheck : faXmark}
          size="s"
          color="currentColor"
        />
        {passwordGateTexts[name]}
      </span>
    {/each}
  </p>

  <button type="submit">Sign Up!</button>

  <p style="display: block; margin-top: 0.4rem;">
    Already a member? <a
      href="/login{data.redirectTo
        ? `?r=${encodeURIComponent(data.redirectTo)}`
        : ''}">Log in</a
    >
  </p>
{:else}
  <h2>Verify Email</h2>
  <p>
    A link has been sent to the email you provided to verify it. The link will
    expire in 5 minutes. By verifying your email, you can get notifications and
    recover your account if you forget the password.
  </p>
  <a
    href="/onboard-device"
    class="button">Continue</a
  >
{/if}

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
  label.invalid {
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
  label.invalid:focus-within {
    outline-color: var(--error);
  }
  label :global(*),
  label input::placeholder {
    color: color-mix(in srgb, var(--text), var(--background) 30%);
    margin: auto 0;
    transition: color 100ms ease-out;
  }
  label.invalid :global(*),
  label.invalid input::placeholder {
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
  button :global(*) {
    color: var(--on-primary);
  }
  button:hover {
    background: color-mix(in srgb, var(--primary), var(--on-primary) 20%);
  }

  .hint {
    display: block;
    margin: 0.3rem 0.3rem 0.8rem;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .hint span {
    font-size: inherit;
    display: flex;
    align-items: center;
    margin-top: 0.2rem;
  }
  .hint :global(svg) {
    margin-bottom: 0.1rem;
    margin-right: 0.3rem;
  }
  .hint.invalid,
  .not-fulfilled,
  .not-fulfilled :global(*) {
    color: color-mix(in srgb, var(--text), var(--error) 60%);
  }

  .error {
    display: flex;
    padding: 1rem 1.5rem;
    border-radius: 0.7rem;
    margin-bottom: 1rem;
    align-items: center;
    background-color: color-mix(in srgb, var(--background), var(--error) 7%);
  }
  .error p {
    margin: 0 0 0 0.75rem;
  }
  .error :global(*) {
    color: color-mix(in srgb, var(--error), var(--text) 5%);
  }

  a.button {
    border-radius: 0.3rem;
    display: flex;
    background: var(--secondary);
    color: var(--on-secondary);
    height: 2.5rem;
    padding: 0 1rem;
    align-items: center;
    margin-left: auto;
    width: fit-content;
  }
  a.button:hover {
    background: color-mix(in srgb, var(--secondary), var(--on-secondary) 10%);
  }
</style>
