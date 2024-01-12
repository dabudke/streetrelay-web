<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<p class:error={data.error}>{data.message}</p>

<style>
  p {
    display: block;
    background-color: color-mix(in srgb, var(--background), var(--primary) 25%);
    color: color-mix(in srgb, var(--text), var(--primary) 10%);
    padding: 1.5rem 2rem;
    border-radius: 0.7rem;
  }
  .error {
    background-color: color-mix(in srgb, var(--background), var(--error) 30%);
    color: color-mix(in srgb, var(--text), var(--error) 10%);
  }
</style>
