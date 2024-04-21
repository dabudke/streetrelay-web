<script lang="ts">
  import { enhance } from "$app/forms";
  import { faStar as faStarOutlined } from "@fortawesome/free-regular-svg-icons";
  import {
    faCircleNotch,
    faSignIn,
    faStar,
    faTag,
    faUserCheck,
    faUserPlus,
  } from "@fortawesome/free-solid-svg-icons";
  import { error } from "@sveltejs/kit";
  import Fa from "svelte-fa";

  export let selfPage: boolean = false;
  export let loggedIn: boolean = true;
  export let userID: string = "";
  export let nickname: string | undefined = undefined;

  export let tagged: boolean = false;
  export let taggedMe: boolean = false;
  export let tagCount: number;
  export let starred: boolean = false;
  export let starredMe: boolean = false;
  export let starCount: number;

  let tagSubmitting = false;
  let starSubmitting = false;

  function numberReadout(num: number): string {
    if (num < 1000) return `${num}`;
    if (num < 100_000) return `${Math.round(num / 100) / 10} K`;
    if (num < 1_000_000) return `${Math.round(num / 1000)} K`;
    if (num < 100_000_000) return `${Math.round(num / 1000 / 100) / 10} mil`;
    if (num < 1_000_000_000) return `${Math.round(num / 1000 / 1000)} mil`;
    if (num < 100_000_000_000)
      return `${Math.round(num / 1000 / 1000 / 100) / 10} bil`;
    error(500, { message: "not a number, or too big of a number" });
  }
</script>

<form
  class="container"
  use:enhance={({ action }) => {
    if (action.search === "?/tag") {
      tagSubmitting = true;
      return ({ update }) => {
        tagSubmitting = false;
        update();
      };
    }
    if (action.search === "?/star") {
      starSubmitting = true;
      return ({ update }) => {
        starSubmitting = false;
        update();
      };
    }
  }}
  method="post"
>
  {#if selfPage}
    <a
      class="button secondary"
      href="/me/profile">Edit Profile</a
    >
    <a
      class="stat"
      href="/me/tags"
    >
      <Fa icon={faTag} />
      {numberReadout(tagCount)}
      <span class="mini">
        <span>THIS</span>
        <span>MONTH</span>
      </span>
    </a>
    <a
      class="stat"
      href="/me/users"
    >
      <Fa icon={faStar} />
      {numberReadout(starCount)}
    </a>
  {:else}
    {#if loggedIn}
      <button
        class="button"
        formaction="?/tag"
        type="submit"
        disabled={tagged || tagSubmitting}
        class:tagged
      >
        {#if tagSubmitting}
          <Fa
            icon={faCircleNotch}
            spin
          />
        {:else}
          <Fa icon={tagged ? faUserCheck : faUserPlus} />
          {#if tagged}
            Tagged
          {:else if taggedMe}
            Tag Back!
          {:else}
            Tag!
          {/if}
        {/if}
      </button>
    {:else}
      <a
        class="button"
        href="/login?r={encodeURIComponent(`/@${userID}`)}"
      >
        <Fa icon={faSignIn} />
        Sign in to Tag!
      </a>
    {/if}
    <span class="stat">
      <Fa icon={faTag} />
      {numberReadout(tagCount)}
      <span class="mini">
        <span>THIS</span>
        <span>MONTH</span>
      </span>
    </span>
    {#if loggedIn}
      <button
        class="stat"
        class:active={starred}
        formaction="?/star"
        type="submit"
      >
        <Fa
          icon={starSubmitting
            ? faCircleNotch
            : starred
              ? faStar
              : faStarOutlined}
          spin={starSubmitting}
          fw
        />
        {numberReadout(starCount)}
      </button>
    {:else}
      <a
        class="stat"
        href="/login?r={encodeURIComponent(`/@${userID}`)}"
      >
        <Fa icon={faStarOutlined} />
        {numberReadout(starCount)}
      </a>
    {/if}
  {/if}
</form>

{#if taggedMe}
  <i class="info">{nickname ?? userID} has tagged you!</i>
{:else if starredMe}
  <i class="info">
    {#if starred}
      You and {nickname ?? userID} have both starred each other!
    {:else}
      {nickname ?? userID} has starred you!
    {/if}
  </i>
{/if}

<style>
  button {
    border: none;
  }

  .container {
    display: flex;
    width: 100%;
    align-items: center;
  }

  .button {
    background-color: var(--primary);
    color: var(--on-primary);
    height: 2.5rem;
    border-radius: 0.4rem;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 100ms ease-out;
    margin-right: 0.75rem;
  }
  .button:hover {
    background-color: color-mix(in srgb, var(--primary), var(--on-primary) 10%);
  }
  .button :global(*) {
    color: inherit;
    margin-right: 0.4rem;
  }
  .button.secondary {
    background-color: var(--secondary);
    color: var(--on-secondary);
  }
  .button.secondary:hover {
    background-color: color-mix(
      in srgb,
      var(--secondary),
      var(--on-secondary) 10%
    );
  }
  .button.tagged {
    background: color-mix(in srgb, var(--text), var(--background) 50%);
    color: var(--background);
  }
  .button:disabled:not(.tagged) {
    background: color-mix(in srgb, var(--primary), var(--background) 50%);
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--text);
    transition:
      background 100ms ease-out,
      color 100ms ease-out;
    background: none;
    padding: 0.5rem 0.75rem;
    border-radius: 1.25rem;
  }
  .stat .mini {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
  }
  .stat .mini * {
    font-size: 0.7rem;
    font-weight: 700;
  }
  .stat :global(*) {
    color: inherit;
  }

  .stat.active {
    color: var(--primary);
  }

  button.stat:hover,
  a.stat:hover {
    background-color: var(--secondary);
  }

  .info {
    margin: 0 auto;
    padding: 0;
  }
</style>
