<script lang="ts">
  import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";

  export let invalid: boolean;
  export let icon: IconDefinition;
  export let value: string = "";
</script>

<label class:invalid>
  <Fa
    {icon}
    fw
  />
  <input
    {...$$props}
    bind:value
    on:input
    on:change
  />
</label>

<style>
  label {
    background: var(--secondary);
    border-radius: 0.3rem;
    width: 100%;
    padding: 0.5rem 0.7rem;
    display: flex;
    align-content: center;
    transition:
      background 100ms ease-out,
      box-shadow 100ms ease-out,
      outline-color 100ms ease-out,
      color 100ms ease-out;
    outline: solid 0.1rem transparent;
    height: 2.5rem;
    color: color-mix(in srgb, var(--text), var(--background) 30%);
  }
  label.invalid {
    background: color-mix(in srgb, var(--error), var(--background) 75%);
    color: color-mix(in srgb, var(--error), var(--on-secondary) 75%);
  }
  label:hover {
    box-shadow: 0 3px 10px -2px color-mix(in srgb, var(--text), transparent 70%);
  }
  label:focus-within {
    background: transparent;
    box-shadow: none;
    outline-color: var(--primary);
    color: var(--text);
  }
  label:focus-within input::placeholder {
    color: color-mix(in srgb, var(--text), var(--background) 30%);
  }
  label.invalid:focus-within input::placeholder {
    color: color-mix(in srgb, var(--error), var(--on-secondary) 75%);
  }
  label.invalid:focus-within {
    outline-color: var(--error);
  }

  label :global(*),
  label input::placeholder {
    color: inherit;
    margin: auto 0;
  }

  input {
    background: transparent;
    border: none;
    margin-left: 0.6rem;
    outline: none;
    flex-grow: 1;
  }
</style>
