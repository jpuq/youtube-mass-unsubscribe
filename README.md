a browser-console javascript script that helps clean up youtube subscriptions.

it shows the channels it finds in the console, lets you add channel names to keep, and unsubscribes from the remaining channels after you type a confirmation.

it runs only in your browser on youtube. it does not ask for your youtube password, use an external server, or collect your data.
## how to use

### 1. open your subscriptions

go to:

`https://www.youtube.com/feed/channels`

make sure you are signed into the youtube account you want to clean up.

### 2. edit your keep list

open `youtube-mass-unsubscribe.js`.

near the top, find:

```javascript
const KEEP_CHANNELS = [
  // "channel name here",
];
```

add channels you want to keep inside the brackets.

example:

```javascript
const KEEP_CHANNELS = [
  "Jidion",
  "Beta Squad",
  "Mr Beast",
];
```

use one channel name per line and remember the comma after each name.

### 3. test with five channels

leave this setting as:

```javascript
const MAX_UNSUBSCRIBES = 5;
```

this means the script can remove only five channels on the first test.

### 4. open the browser console

press:

```text
ctrl + shift + i
```

click the `console` tab.

if chrome warns you about pasting code, type this manually and press enter:

```text
allow pasting
```

### 5. run the script

copy all code from `youtube-mass-unsubscribe.js`.

paste it into the youtube console and press `enter`.

the script will:

1. scroll and find loaded subscriptions
2. print a table of channel names
3. mark each channel as `keep` or `unsubscribe`
4. ask you to type `UNSUBSCRIBE`
5. unsubscribe from up to five channels

### 6. run it on all channels

only after the test works correctly, change:

```javascript
const MAX_UNSUBSCRIBES = 5;
```

to:

```javascript
const MAX_UNSUBSCRIBES = Infinity;
```

then run the script again.

### stop the script

refresh the youtube page to stop it.
