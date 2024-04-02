<script lang="ts">
  import {
    faWarning,
    type IconDefinition,
  } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";

  export let style: "error" | "success" = "error";
  export let icon: IconDefinition = faWarning;
</script>

<div class={style}>
  <Fa
    {icon}
    size="1x"
  />
  <span>
    <slot />
  </span>
</div>

<style>
  div {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 1rem 1rem;
    border-radius: 0.8rem;
  }
  div :global(*) {
    color: inherit;
  }
  div :global(:not(:last-child)) {
    margin-right: 0.8rem;
  }

  .error {
    background-color: var(--error);
    color: var(--on-error);
  }
  .success {
    background-color: color-mix(in srgb, var(--background), var(--primary) 20%);
    color: var(--on-background);
  }
</style>
