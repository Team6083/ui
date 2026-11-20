// Pictures for the demo's people, so the avatars show both a picture and initials.
//
// ultrafastparrot.gif is Ultra Fast Parrot from Cult of the Party Parrot
// (https://cultofthepartyparrot.com/, github.com/jmhobbs/cultofthepartyparrot.com).
// The original parrot is by Geiger Powell, who allows unlimited use and adaptation.
// cat.svg and mountain.svg were drawn for this demo.
import cat from "./cat.svg"
import mountain from "./mountain.svg"
import parrot from "./ultrafastparrot.gif"

export const AVATARS: Record<string, string> = {
  // Alex Chen is the signed-in user in the header.
  "Alex Chen": mountain,
  林怡君: cat,
  "Jordan Lee": parrot,
}
