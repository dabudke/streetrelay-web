<script>
  import { applyAction, enhance } from "$app/forms";
  import { goto } from "$app/navigation";

  let loading = false;
</script>

<form
  class="background"
  method="post"
  novalidate
  use:enhance={() => {
    loading = true;
    return async ({ result }) => {
      loading = false;
      if (result.type === "redirect") {
        goto(result.location);
      } else {
        await applyAction(result);
      }
    };
  }}
>
  <fieldset
    class:loading
    class="card"
    disabled={loading}
  >
    <slot />
  </fieldset>
</form>

<style>
  :global(body) {
    overflow-x: hidden;
  }
  .background {
    min-height: 100vh;
    width: 100vw;
    background: linear-gradient(
      to bottom right,
      color-mix(in srgb, var(--primary), var(--background) 80%),
      var(--background)
    );
    margin: 0;
    padding: 3rem 1.5rem 0;
  }
  .card {
    border: none;
    border-radius: 2rem;
    padding: 2rem;
    background-color: var(--background);
    margin: 0 auto;
    max-width: 30rem;
    box-shadow: 0 3px 10px -2px rgba(0, 0, 0, 0.4);
    transition: all 300ms ease-out;
  }

  .loading :global(*) {
    opacity: 0.6;
  }
</style>
