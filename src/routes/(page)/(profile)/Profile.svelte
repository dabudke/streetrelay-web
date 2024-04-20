<script lang="ts">
  export let profilePicture: string;
  export let nickname: string | null;
  export let userID: string;
</script>

<div class="container">
  <img
    src={profilePicture}
    alt="profile picture of {nickname ?? userID}"
  />
  <span class="text">
    <h1>{nickname ?? `@${userID}`}</h1>
    {#if nickname != undefined}
      <h2>@{userID}</h2>
    {/if}
  </span>
</div>

<style>
  .container {
    display: flex;
    align-items: center;
  }

  img {
    height: 4.5rem;
    width: 4.5rem;
    border-radius: 0.7rem;
  }

  .text {
    margin-left: 1rem;
    display: flex;
    flex-direction: column;
  }

  h1 {
    font-size: 1.4rem;
    margin-bottom: 0;
    margin-top: 0.1rem;
  }

  h2 {
    margin-top: 0.3rem;
    margin-bottom: 0;
    font-size: 0.9rem;
  }
</style>
