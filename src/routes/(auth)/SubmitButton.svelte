<script lang="ts">
  import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";

  export let submitting: boolean;
</script>

<button
  type="submit"
  disabled={submitting}
>
  {#if submitting}
    <Fa
      icon={faCircleNotch}
      spin
    />
  {:else}
    <slot />
  {/if}
</button>

<style>
  button {
    border-radius: 0.3rem;
    transition:
      background 100ms ease-out,
      color 100ms ease-out;
    background: var(--primary);
    color: var(--on-primary);
    border: none;
    width: 100%;
    height: 2.5rem;
  }
  button :global(*) {
    color: inherit;
  }
  button:hover {
    background: color-mix(in srgb, var(--primary), var(--on-primary) 20%);
  }
  button:disabled {
    background: color-mix(in srgb, var(--primary), var(--background) 50%);
  }
</style>
