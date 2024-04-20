<div class="container">
  <div class="body">
    <slot />
  </div>
</div>

<style>
  .container {
    width: 100vw;
    margin: 0;
    display: grid;
    place-items: center;
    padding: 0 3rem;
  }

  .body {
    width: 100%;
    min-width: 18rem;
    max-width: 32rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .body > :global(:not(:last-child)) {
    margin-bottom: 1rem;
  }
</style>
