<script lang="ts">
  import { faCheck } from "@fortawesome/free-solid-svg-icons";
  import InfoBox from "../InfoBox.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<InfoBox
  style={data.error ? "error" : "success"}
  icon={data.error ? undefined : faCheck}
>
  {data.message}
</InfoBox>
