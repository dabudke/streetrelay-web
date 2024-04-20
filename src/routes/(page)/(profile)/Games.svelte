<script lang="ts">
  import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
  import type { Game } from "@prisma/client";
  import Fa from "svelte-fa";

  export let selfPage: boolean = false;
  export let games: Game[];
</script>

<h3>
  Games
  {#if selfPage}
    <a
      class="editButton"
      href="/me/games"
    >
      <Fa icon={faEdit} /></a
    >
  {/if}
</h3>
<ul class="games">
  {#each games as game}
    <li title={`${game.title} (${game.id})`}>
      <img
        src={game.icon}
        alt="icon for {game.title}"
      />
    </li>
  {:else}
    {#if selfPage}
      <i class="nogames"
        >You haven't uploaded any games yet. Upload one from your 3DS to get
        started!</i
      >
    {:else}
      <i class="nogames">No games uploaded yet.</i>
    {/if}
  {/each}
  {#if selfPage}
    <li class="ghost"><a href="/me/games"><Fa icon={faPlus} /></a></li>
  {/if}
</ul>

<style>
  .editButton :global(*) {
    margin-left: 0.2rem;
    color: var(--accent);
    transition: color 100ms ease-out;
  }
  .editButton:hover :global(*) {
    color: var(--text);
  }

  .games {
    display: flex;
    margin: 0;
    padding: 0;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  li::marker {
    content: none;
  }
  .games li {
    height: 3.8rem;
    width: 3.8rem;
    background-color: var(--secondary);
    display: grid;
    place-items: center;
    border-radius: 0.5rem;
  }
  .games li img {
    height: 3rem;
    width: 3rem;
    border-radius: 0.25rem;
  }

  .games li.ghost {
    height: 3.62rem;
    width: 3.62rem;
    margin-top: 0.18rem;
    background: none;
    border: dashed color-mix(in srgb, var(--background), var(--text)) 0.18rem;
  }
  .games li.ghost a {
    height: 100%;
    width: 100%;
    display: grid;
    place-items: center;
  }
  .games li.ghost :global(*) {
    color: color-mix(in srgb, var(--background), var(--text));
  }
</style>
