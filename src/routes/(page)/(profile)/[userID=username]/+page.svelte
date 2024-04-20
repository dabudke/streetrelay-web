<script lang="ts">
  import Fa from "svelte-fa";
  import AboutMe from "../AboutMe.svelte";
  import Actions from "../Actions.svelte";
  import Games from "../Games.svelte";
  import Profile from "../Profile.svelte";
  import type { ActionData, PageData } from "./$types";
  import { faXmark } from "@fortawesome/free-solid-svg-icons";
  import { fly } from "svelte/transition";
  import { enhance } from "$app/forms";
  import { page } from "$app/stores";

  export let data: PageData;
  export let form: ActionData;

  let toastData: string | undefined = undefined;
  $: toastData = form?.message;
  function dismissToast() {
    toastData = undefined;
  }
</script>

{#if toastData}
  <div
    class="toast"
    class:error={$page.status !== 200}
    transition:fly={{ opacity: 0, y: -10 }}
  >
    {toastData}
    <button on:click={dismissToast}>
      <Fa
        icon={faXmark}
        size="1x"
      />
    </button>
  </div>
{/if}

<Profile
  profilePicture={data.profilePicture}
  nickname={data.nickname}
  userID={data.userID}
/>
<Actions
  loggedIn={data.loggedIn}
  userID={data.userID}
  tagged={data.tagged}
  taggedMe={data.taggedMe}
  tagCount={data.tags}
  starred={data.starred}
  starredMe={data.starredMe}
  starCount={data.stars}
/>
<AboutMe bio={data.bio} />
<Games games={data.games} />

<style>
  .toast {
    position: absolute;
    background: var(--accent);
    color: var(--on-accent);
    padding: 1rem 0.9rem 1rem 1.25rem;
    border-radius: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .toast :global(*) {
    color: inherit;
  }
  .toast button {
    border: none;
    height: 1.5rem;
    width: 1.5rem;
    display: grid;
    place-items: center;
    border-radius: 1rem;
    background: transparent;
    transition: background 100ms ease-out;
  }
  .toast button:hover {
    background-color: color-mix(in srgb, var(--accent), var(--background) 20%);
  }
  .toast.error {
    background: var(--error);
    color: var(--on-error);
  }
  .toast.error button:hover {
    background-color: color-mix(in srgb, var(--error), var(--background) 20%);
  }
</style>
