(async function youtubeMassUnsubscribe() {
  // =========================
  // settings
  // =========================

  const KEEP_CHANNELS = [
    // add channel names here, one per line
    // examples:
    // "Markiplier",
    // "Jidion",
    // "Beta Squad",
  ];

  const MAX_UNSUBSCRIBES = 5;
  // keep this at 5 when testing.
  // change to Infinity when you are sure it works.

  const DELAY_MS = 1400;
  // delay between each unsubscribe.
  // do NOT make this too low.

  // =========================
  // helper functions
  // =========================

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const isVisible = (element) =>
    Boolean(element && element.offsetParent !== null);

  const normalize = (text = "") =>
    text.replace(/\s+/g, " ").trim().toLowerCase();

  const shouldKeepChannel = (channelName) =>
    KEEP_CHANNELS.some((keepName) =>
      normalize(channelName).includes(normalize(keepName))
    );

  const getControls = () =>
    Array.from(
      document.querySelectorAll(
        "ytd-subscription-notification-toggle-button-renderer-next"
      )
    ).filter(isVisible);

  const getSubscribedButton = (control) =>
    control.querySelector("yt-button-shape > button, button");

  const getChannelName = (control) => {
    const row =
      control.closest("ytd-channel-renderer") ||
      control.closest("ytd-rich-item-renderer") ||
      control.closest("ytd-grid-channel-renderer") ||
      control.parentElement?.parentElement?.parentElement?.parentElement;

    const link = row?.querySelector(
      "#channel-title, a#main-link, a[href^='/@'], a[href^='/channel/']"
    );

    const nameFromPage = link?.textContent?.trim();
    const buttonLabel = getSubscribedButton(control)?.getAttribute("aria-label") || "";

    return (
      nameFromPage ||
      buttonLabel.replace(/^subscribed to\s*/i, "") ||
      "unknown channel"
    );
  };

  const findMenuUnsubscribe = () =>
    Array.from(
      document.querySelectorAll(
        "ytd-menu-service-item-renderer, tp-yt-paper-item, yt-formatted-string"
      )
    ).find(
      (element) =>
        isVisible(element) &&
        normalize(element.textContent) === "unsubscribe"
    );

  const findConfirmButton = () =>
    Array.from(document.querySelectorAll("button")).find(
      (button) =>
        isVisible(button) &&
        normalize(button.textContent) === "unsubscribe"
    );

  // =========================
  // load all visible channels
  // =========================

  console.log("loading subscriptions...");

  let previousCount = 0;
  let unchangedRounds = 0;

  while (unchangedRounds < 3) {
    window.scrollTo(0, document.documentElement.scrollHeight);
    await sleep(1200);

    const currentCount = getControls().length;

    if (currentCount === previousCount) {
      unchangedRounds++;
    } else {
      previousCount = currentCount;
      unchangedRounds = 0;
    }
  }

  const subscriptions = getControls().map((control) => ({
    control,
    name: getChannelName(control),
  }));

  if (subscriptions.length === 0) {
    console.warn(
      "no channels found. make sure you are on https://www.youtube.com/feed/channels"
    );
    return;
  }

  const targets = subscriptions.filter(
    (subscription) => !shouldKeepChannel(subscription.name)
  );

  // =========================
  // preview
  // =========================

  console.log(`found ${subscriptions.length} subscribed channels.`);
  console.log(`keeping ${subscriptions.length - targets.length} channel(s).`);
  console.log(
    `ready to unsubscribe from up to ${Math.min(targets.length, MAX_UNSUBSCRIBES)} channel(s).`
  );

  console.table(
    subscriptions.map((subscription, index) => ({
      number: index + 1,
      channel: subscription.name,
      action: shouldKeepChannel(subscription.name) ? "keep" : "unsubscribe",
    }))
  );

  const confirmation = prompt(
    `found: ${subscriptions.length} channel(s)\n` +
    `keep: ${subscriptions.length - targets.length}\n` +
    `unsubscribe: ${Math.min(targets.length, MAX_UNSUBSCRIBES)}\n\n` +
    `check the console table first.\n\n` +
    `type UNSUBSCRIBE to start.`
  );

  if (confirmation !== "UNSUBSCRIBE") {
    console.log("cancelled. nothing was unsubscribed.");
    return;
  }

  // =========================
  // unsubscribe
  // =========================

  let removed = 0;

  for (const subscription of targets) {
    if (removed >= MAX_UNSUBSCRIBES) break;

    const button = getSubscribedButton(subscription.control);

    if (!button || !isVisible(button)) {
      console.warn(`skipped: ${subscription.name} (button not found)`);
      continue;
    }

    button.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });

    await sleep(350);
    button.click();
    await sleep(550);

    const unsubscribeMenuItem = findMenuUnsubscribe();

    if (!unsubscribeMenuItem) {
      console.warn(
        `stopped: could not find unsubscribe menu for ${subscription.name}`
      );
      break;
    }

    unsubscribeMenuItem.click();
    await sleep(600);

    const confirmButton = findConfirmButton();

    if (!confirmButton) {
      console.warn(
        `stopped: could not find confirmation button for ${subscription.name}`
      );
      break;
    }

    confirmButton.click();
    removed++;

    console.log(`✅ [${removed}] unsubscribed: ${subscription.name}`);
    await sleep(DELAY_MS);
  }

  console.log(`finished. unsubscribed from ${removed} channel(s).`);
})();
