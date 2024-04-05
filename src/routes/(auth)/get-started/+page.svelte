<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import {
    faCheck,
    faEnvelope,
    faKey,
    faUser,
    faXmark,
  } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";
  import InfoBox from "../InfoBox.svelte";
  import Input from "../Input.svelte";
  import Links from "../Links.svelte";
  import SubmitButton from "../SubmitButton.svelte";
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

  let submitting: boolean = false;

  let username: string;
  let email: string;

  let password = "";
  let passwordOK = true;
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

<svelte:head>
  <title>Get Started | StreetRelay</title>
</svelte:head>

{#if !form || !form.success}
  <form
    method="post"
    use:enhance={({ formData, cancel }) => {
      submitting = true;

      return async ({ result }) => {
        submitting = false;
        await applyAction(result);
      };
    }}
  >
    {#if form?.error.creation}
      <InfoBox>
        {form.error.creation}
      </InfoBox>
    {/if}

    <h1>Welcome to StreetRelay!</h1>
    <p>Create an account and join the fun!</p>
    <Input
      invalid={!!form?.error.email}
      icon={faEnvelope}
      type="email"
      name="email"
      autocomplete="email"
      placeholder="Email Address"
      aria-label="Email Address"
      on:change={() => {
        if (form !== null) form.error.email = null;
      }}
    />
    {#if form?.error.email}
      <p class="hint invalid">{form?.error.email}</p>
    {:else}<br />{/if}

    <Input
      invalid={!!form?.error.username}
      icon={faUser}
      type="text"
      name="username"
      autocomplete="username"
      placeholder="Username"
      aria-label="Username"
      on:change={() => {
        if (form !== null) form.error.username = null;
      }}
    />
    {#if form?.error.username}
      <p class="hint invalid">{form?.error.username}</p>
    {:else}
      <p class="hint">
        Must be 3-30 characters long, and only contain uppercase and lowercase
        letters, numbers, and underscores.
      </p>
    {/if}

    <Input
      invalid={!passwordOK || !!form?.error.password}
      icon={faKey}
      type="password"
      name="password"
      autocomplete="new-password"
      placeholder="Create Password"
      aria-label="New Password"
      bind:value={password}
      on:change={() => {
        if (form !== null) form.error.password = false;
        onPasswordChange();
        passwordOK = Object.values(passwordGates).every((v) => v === true);
      }}
      on:input={onPasswordChange}
    />
    <p class="hint">
      {#each Object.entries(passwordGates) as [name, fulfilled]}
        <span class:not-fulfilled={!fulfilled}>
          <Fa
            icon={fulfilled ? faCheck : faXmark}
            size="1x"
            color="currentColor"
            fw
          />
          {passwordGateTexts[name]}
        </span>
      {/each}
    </p>

    <SubmitButton {submitting}>Sign Up!</SubmitButton>

    <Links>
      <a
        href="/login{data.redirectTo
          ? `?r=${encodeURIComponent(data.redirectTo)}`
          : ''}">Log In</a
      >
    </Links>
  </form>
{:else}
  {#if form.success !== true}
    <InfoBox>{form.success}</InfoBox>
    <p>For now, continue on to add your device.</p>
  {:else}
    <h2>Verify Email</h2>
    <p>
      A link has been sent to the email you provided to verify it. The link will
      expire in 10 minutes. By verifying your email, you can get email
      notifications and recover your account if you forget the password.
    </p>
  {/if}
  <a
    href="/onboard-device"
    class="button">Continue</a
  >
{/if}

<style>
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
  .hint span :global(*) {
    margin-right: 0.1rem;
  }
  .hint.invalid,
  .not-fulfilled,
  .not-fulfilled :global(*) {
    color: color-mix(in srgb, var(--text), var(--error) 60%);
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
