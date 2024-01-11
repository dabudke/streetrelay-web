<script lang="ts">
  import type { ActionData, PageData } from "./$types";

  export let form: ActionData;
</script>

{#if form}
  <h1>Scan QR Code</h1>
  <p>Scan the QR code below with the StreetRelay client</p>
  
  <img
    src={form.code}
    alt="StreetRelay client registration token"
  />

  <p>Once you have scanned the code and your upload has started, click the button below to continue to your profile.</p>
  <a class="button" href="/me">Go to Your Profile</a>
{:else}
  <h1>Add device</h1>
  <p>
    Download the Streetrelay Client to your 3DS, the link can be found on the
    GitHub page
  </p>
  <p>Once the client is downloaded, open it up and click "Continue"</p>

  <button class="button" formaction="?/create">Continue</button>
{/if}

<style>
  .button {
    border-radius: 0.3rem;
    display: flex;
    background: var(--secondary);
    color: var(--on-secondary);
    height: 2.5rem;
    padding: 0 1rem;
    align-items: center;
    margin-left: auto;
    width: fit-content;
    border: none;
  }
  .button:hover {
    background: color-mix(in srgb, var(--secondary), var(--on-secondary) 10%);
  }
  </style>
