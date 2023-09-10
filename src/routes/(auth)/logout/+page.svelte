<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import { page } from "$app/stores";

  export let data: PageData;
</script>

{#if data.error}
  <div class="error">Not logged in, please log in to log out</div>
{:else}
  {#if $page.status === 401}
    <div class="error">You have already been logged out</div>
  {/if}
  <form method="post">
    <button type="submit">Log Out</button>
  </form>
{/if}

<style>
  button {
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    background-color: var(--primary);
    color: var(--on-primary);
    border: none;
  }

  .error {
    background: var(--error);
    color: var(--on-error);
    padding: 1.5rem 2rem;
    border-radius: 1rem;
  }
</style>
