<span>
  <slot />
</span>

<style>
  span {
    margin-top: 0.8rem;
    display: flex;
    width: 100%;
    justify-content: center;
    color: var(--accent);
  }
  span :global(*) {
    display: block;
  }
  span :global(:not(:last-child)::after) {
    margin: 0 0.5rem;
    content: "•";
  }
</style>
