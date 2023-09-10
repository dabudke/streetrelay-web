<div class="card">
  <slot />
</div>

<style>
  .card {
    border-radius: 2rem;
    padding: 2rem;
    background-color: var(--secondary);
    margin: 3rem auto;
    width: fit-content;
    box-shadow: 0 3px 10px -2px rgba(0, 0, 0, 0.4);
  }
</style>
