<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import { page } from "$app/stores";
  import { faKey, faUserCircle } from "@fortawesome/free-solid-svg-icons";
  import InfoBox from "../InfoBox.svelte";
  import Input from "../Input.svelte";
  import Links from "../Links.svelte";
  import SubmitButton from "../SubmitButton.svelte";
  import type { ActionData, PageData, Snapshot } from "./$types";

  export let data: PageData;

  export let form: ActionData;

  export const snapshot: Snapshot<{ username: string }> = {
    capture: () => ({ username: usernameOrEmail }),
    restore: (data) => {
      usernameOrEmail = data.username;
    },
  };

  let usernameOrEmail: string = form?.username ?? data.username ?? "";
  let submitting: boolean = false;
</script>

<svelte:head>
  <title>Login | StreetRelay</title>
</svelte:head>

{#if data.error}
  <InfoBox>{data.error}</InfoBox>
{/if}

<h1>Welcome Back to StreetRelay!</h1>
<p>To continue, please log in.</p>

<form
  method="post"
  use:enhance={() => {
    submitting = true;
    return async ({ result }) => {
      submitting = false;
      await applyAction(result);
    };
  }}
>
  <Input
    invalid={!!form?.error.usernameOrEmail}
    icon={faUserCircle}
    type="text"
    name="usernameOrEmail"
    autocomplete="username"
    placeholder="Username or Email"
    aria-label="Username or Email"
    bind:value={usernameOrEmail}
    on:change={() => {
      if (form !== null) form.error.usernameOrEmail = null;
    }}
  >
    {#if form?.error.usernameOrEmail}
      {form?.error.usernameOrEmail}
    {/if}
  </Input>

  <Input
    invalid={!!form?.error.password}
    icon={faKey}
    type="password"
    name="password"
    autocomplete="current-password"
    placeholder="Password"
    aria-label="Password"
    on:change={() => {
      if (form !== null) form.error.password = null;
    }}
  >
    {#if form?.error.password}
      {form?.error.password}
    {/if}
  </Input>

  <SubmitButton {submitting}>Log In</SubmitButton>
</form>

<Links>
  <a
    href="/get-started{$page.url.searchParams.get('r')
      ? `?r=${encodeURIComponent($page.url.searchParams.get('r') ?? '')}`
      : ''}"
  >
    Get Started
  </a>
  <a href="/reset-password">Reset Password</a>
</Links>
