<script lang="ts">
  import Fa from "svelte-fa";
  import type { ActionData, PageData } from "./$types";
  import {
    faCheck,
    faCircleNotch,
    faEnvelope,
    faKey,
    faWarning,
    faXmark,
  } from "@fortawesome/free-solid-svg-icons";
  import { applyAction, enhance } from "$app/forms";
  import Input from "../Input.svelte";
  import InfoBox from "../InfoBox.svelte";
  import SubmitButton from "../SubmitButton.svelte";
  import { page } from "$app/stores";
  import Links from "../Links.svelte";

  export let data: PageData;
  export let form: ActionData;

  let newPassword = "";
  let passwordOK = false;
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
    passwordGates.lowercase = !!newPassword.match(/[a-z]/);
    passwordGates.uppercase = !!newPassword.match(/[A-Z]/);
    passwordGates.symbol = !!newPassword.match(/[\W_]/);
    passwordGates.number = !!newPassword.match(/[0-9]/);
    passwordGates.length = newPassword.length >= 8;
  }

  let submitting = false;
</script>

<svelte:head>
  <title>Reset Password | StreetRelay</title>
</svelte:head>

{#if data.resetPassword === true}
  {#await data.result}
    <div class="loading">
      <Fa
        icon={faCircleNotch}
        size="lg"
        spin
      />
    </div>
  {:then result}
    {#if result?.success}
      {#if form?.success}
        <InfoBox
          style="success"
          icon={faCheck}
        >
          Your password has successfully been reset.
        </InfoBox>
        <Links>
          <a href="/login">Back to Log In</a>
        </Links>
      {:else}
        {#if form !== null && form.error.global !== null}
          <InfoBox>{form.error.global}</InfoBox>
        {/if}
        <form
          method="post"
          action="?/changePassword"
          use:enhance={() => {
            submitting = true;
            return async ({ result }) => {
              submitting = false;
              await applyAction(result);
            };
          }}
        >
          <h1>Change Password</h1>
          <p>Enter your new StreetRelay password.</p>
          <Input
            invalid={form !== null && form.error.password !== null}
            icon={faKey}
            type="password"
            name="password"
            autocomplete="new-password"
            placeholder="New Password"
            aria-label="New Password"
            bind:value={newPassword}
            on:change={() => {
              onPasswordChange();
              if (form !== null) {
                form.error.password = null;
              }
              passwordOK = Object.values(passwordGates).some(
                (v) => v === false
              );
            }}
            on:input={onPasswordChange}
          />
          <p class="hint">
            {#each Object.entries(passwordGates) as [name, fulfilled]}
              <span class:not-fulfilled={!fulfilled}>
                <Fa
                  icon={fulfilled ? faCheck : faXmark}
                  size="1x"
                />
                {passwordGateTexts[name]}
              </span>
            {/each}
          </p>
          <SubmitButton {submitting}>Change Password</SubmitButton>
          <input
            type="hidden"
            name="token"
            value={$page.url.searchParams.get("t")}
          />
        </form>
      {/if}
    {:else}
      <InfoBox>
        {result?.error ?? " An internal error occured."}
      </InfoBox>
      <Links>
        <a href="/reset-password">Reset Password</a>
      </Links>
    {/if}
  {/await}
{:else}
  {#if form?.success}
    <InfoBox
      style="success"
      icon={faCheck}
    >
      Check your email. If you have verified the entered email address, you will
      recieve a link to reset your password.
    </InfoBox>
  {/if}
  {#if form !== null && form.error.global !== null}
    <InfoBox>{form.error.global}</InfoBox>
  {/if}
  <!-- email aquisition form -->
  <h1>Reset Password</h1>
  <p>
    To reset your password, enter the email address associated with your
    StreetRelay account below. If you email has been verified, you will recieve
    an email with a link to reset your password.
  </p>
  <form
    use:enhance={() => {
      submitting = true;
      return ({ update }) => {
        submitting = false;
        update();
      };
    }}
    method="post"
    action="?/sendEmail"
    novalidate
  >
    <Input
      invalid={form !== null && form.error.email !== null}
      icon={faEnvelope}
      type="email"
      name="email"
      autocomplete="email"
      placeholder="Email"
      aria-label="Email"
      on:change={() => {
        if (form?.error) {
          form.error.email = null;
        }
      }}
    />
    {#if form !== null && form.error.email !== null}
      <p class="hint invalid">{form.error.email}</p>
    {:else}<br />{/if}
    <SubmitButton {submitting}>Send Email</SubmitButton>
  </form>
  <Links>
    <a href="/get-started">Sign Up</a>
    <a href="/login">Back to Log In</a>
  </Links>
{/if}

<style>
  .loading {
    width: 100%;
    display: flex;
    justify-content: center;
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
  .hint :global(*) {
    color: inherit;
    margin-right: 0.3rem;
  }
  .hint.invalid,
  .not-fulfilled {
    color: color-mix(in srgb, var(--text), var(--error) 60%);
  }
</style>
