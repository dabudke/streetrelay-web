<script lang="ts">
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";

  export let selfPage: boolean = false;
  export let bio: string | null;
</script>

<div class="container">
  <h3>
    About Me
    {#if selfPage}
      <a
        class="editButton"
        href="/me/profile"
      >
        <Fa icon={faEdit} />
      </a>
    {/if}
  </h3>
  <p class="bio">
    {#if bio}
      {bio}
    {:else}
      <i>No bio provided.</i>
    {/if}
  </p>
</div>

<style>
  .editButton :global(*) {
    margin-left: 0.2rem;
    color: var(--accent);
    transition: color 100ms ease-out;
  }
  .editButton:hover :global(*) {
    color: var(--text);
  }
</style>
