<div class="background">
  <form
    class="card"
    method="post"
    novalidate
  >
    <slot />
  </form>
</div>

<style>
  .background {
    min-height: 100vh;
    width: 100vw;
    background: linear-gradient(
      to bottom right,
      color-mix(in srgb, var(--primary), var(--background) 80%),
      var(--background)
    );
    margin: 0;
    padding: 3rem;
  }
  .card {
    border-radius: 2rem;
    padding: 2rem;
    background-color: var(--background);
    margin: 0 auto;
    max-width: 30rem;
    box-shadow: 0 3px 10px -2px rgba(0, 0, 0, 0.4);
  }
</style>
