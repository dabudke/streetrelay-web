<script>
  import Profile from "../Profile.svelte";
  import { page } from "$app/stores";
</script>

<Profile
  profilePicture="/img/unknown.png"
  userID={$page.error?.message}
  nickname="User does not exist"
/>
