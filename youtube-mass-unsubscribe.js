(async function unsubscribeAll() {
  const DELAY_MS = 1400;
  let totalUnsubscribed = 0;
  let noNewButtonsRounds = 0;

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  console.log("starting youtube mass-unsubscribe...");
  console.log("please refresh the page to stop.");

  while (noNewButtonsRounds < 4) {
    const subscriptionControls = Array.from(
      document.querySelectorAll(
        "ytd-subscription-notification-toggle-button-renderer-next"
      )
    );

    if (subscriptionControls.length === 0) {
      console.log("no subscription controls visible yet. scrolling...");
      window.scrollBy(0, 700);
      await sleep(1500);
      noNewButtonsRounds++;
      continue;
    }

    let unsubscribedThisRound = 0;

    for (const control of subscriptionControls) {
      const button = control.querySelector("button");

      if (!button) continue;

      const buttonText = button.innerText.trim().toLowerCase();
      const buttonLabel = (button.getAttribute("aria-label") || "").toLowerCase();

      if (
        !buttonText.includes("subscribed") &&
        !buttonLabel.includes("subscribed")
      ) {
        continue;
      }

      button.scrollIntoView({ block: "center" });
      await sleep(300);

      button.click();
      await sleep(500);

      const menuUnsubscribe = Array.from(
        document.querySelectorAll(
          "ytd-menu-service-item-renderer, tp-yt-paper-item, yt-formatted-string"
        )
      ).find((element) => element.innerText.trim().toLowerCase() === "unsubscribe");

      if (!menuUnsubscribe) {
        console.warn("Could not find Unsubscribe menu option. Stopping.");
        return;
      }

      menuUnsubscribe.click();
      await sleep(550);

      const confirmButton =
        document.querySelector("yt-button-renderer#confirm-button button") ||
        document.querySelector("#confirm-button button");

      if (!confirmButton) {
        console.warn("could not find unsubscribe confirmation. stopping.");
        return;
      }

      confirmButton.click();
      totalUnsubscribed++;
      unsubscribedThisRound++;

      console.log(`✅ unsubscribed: ${totalUnsubscribed}`);

      await sleep(DELAY_MS);
    }

    if (unsubscribedThisRound === 0) {
      noNewButtonsRounds++;
      console.log("loading more subscriptions...");
      window.scrollBy(0, 900);
      await sleep(1600);
    } else {
      noNewButtonsRounds = 0;
    }
  }

  console.log(`finished. unsubscribed from ${totalUnsubscribed} channel(s).`);
})();
