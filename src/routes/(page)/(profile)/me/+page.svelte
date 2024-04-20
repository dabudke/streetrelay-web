<script lang="ts">
  import AboutMe from "../AboutMe.svelte";
  import Actions from "../Actions.svelte";
  import Games from "../Games.svelte";
  import Profile from "../Profile.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>Your Profile | StreetRelay</title>
</svelte:head>

<Profile
  profilePicture={data.profilePicture}
  nickname={data.nickname}
  userID={data.userID}
/>
<Actions
  selfPage
  starCount={data.stars}
  tagCount={data.tags}
/>
<AboutMe selfPage bio={data.bio} />
<Games selfPage games={data.games} />
