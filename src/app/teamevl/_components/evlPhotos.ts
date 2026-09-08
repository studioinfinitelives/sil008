import { cdnUrl } from "@/lib/cdn";

/**
 * The photographs of real games that ride the turntable on /teamevl.
 *
 * Kept out of the component, the way `evlLinks` is kept out of the drawer: the
 * list is the part most likely to be reordered or added to, and a plain array
 * is something the test can assert the carousel against rather than restating.
 *
 * Ordered so the setting changes from one card to the next — a convention hall,
 * then a Christmas tree, then a dining table — because three café shots in a row
 * read as one photograph the ring failed to advance past.
 *
 * The list can be any length: the ring holds six cards and the rest of the
 * queue waits its turn, so adding a photograph here is the whole job.
 *
 * **The filenames are coined here, not in `lib/cdn.ts`.** Every other piece of
 * art on the site is named there, but a photograph's name, its alt text and its
 * place in the running order are one decision, and splitting them across two
 * files would make adding one a two-file edit for no gain. `cdn.test.ts` reads
 * this list, so a name here that is not in `cdn/` still fails the build.
 *
 * Republished at **800px on the long edge**, down from the full camera
 * resolution they were supplied at — ~30 MB for the ten, now under 1 MB.
 * `next/image` is unoptimized site-wide, so that is byte-for-byte what a
 * visitor downloads: six on first paint and the rest as they come round. A
 * card is at most 260px wide and cropped to 3:4, so 800 is still better than
 * twice the tallest it is ever drawn.
 *
 * Because `/cdn/**` is immutable a photograph cannot be replaced in place —
 * a recrop is a new filename here.
 */

export interface EvlPhoto {
  src: string;
  /**
   * What is happening in the photograph, never who is in it. These are
   * identifiable people who lent us their game night — describe the game, and
   * do not add names.
   */
  alt: string;
  /**
   * The photo's size as uploaded, which is also the size a browser draws it:
   * several of these were shot on phones and carried an EXIF orientation, and
   * the downscale baked that rotation into the pixels rather than passing the
   * tag along. So there is no longer a stored-versus-rendered split to track —
   * what is here is what `next/image` reserves and what the file is.
   */
  width: number;
  height: number;
  /**
   * `object-position` for the 3:4 crop, when centring it cuts off a head.
   * Unset everywhere to begin with; it exists so a bad crop can be nudged after
   * looking at the page, without touching the carousel.
   */
  focus?: string;
}

export const evlPhotos: EvlPhoto[] = [
  {
    src: cdnUrl("evl_photo_convention.jpg"),
    alt: "Three players leaning over a ritual circle at a convention table, the hall busy behind them",
    width: 800,
    height: 600,
  },
  {
    src: cdnUrl("evl_photo_box_gift.jpg"),
    alt: "A player holding up the Team EvL box beside a Christmas tree",
    width: 600,
    height: 800,
  },
  {
    src: cdnUrl("evl_photo_livingroom.jpg"),
    alt: "A game in progress around a long dining table, cards dealt out and a poster on the wall behind",
    width: 600,
    height: 800,
  },
  {
    src: cdnUrl("evl_photo_kitchen_table.jpg"),
    alt: "Five players crowded into a selfie mid-game, cards held up to the camera",
    width: 800,
    height: 450,
  },
  {
    src: cdnUrl("evl_photo_window_pair.jpg"),
    alt: "Two players facing off across a café table in the window, the circle laid out between them",
    width: 602,
    height: 800,
  },
  {
    src: cdnUrl("evl_photo_box_eye.jpg"),
    alt: "A player holding the Team EvL box up over one eye, the ritual circle on the lid staring out",
    width: 800,
    height: 800,
  },
  {
    src: cdnUrl("evl_photo_patio.jpg"),
    alt: "A group around an outdoor table on a sunny street, drinks and the game between them",
    width: 800,
    height: 600,
  },
  {
    src: cdnUrl("evl_photo_card_eyes.jpg"),
    alt: "A player holding two Ritual Cards up in front of their eyes like spectacles",
    width: 600,
    height: 800,
  },
  {
    src: cdnUrl("evl_photo_booth_four.jpg"),
    alt: "Four players in a café booth, Element tokens spread across the table",
    width: 602,
    height: 800,
  },
  {
    src: cdnUrl("evl_photo_box_face.jpg"),
    alt: "A player pulling a face behind the Team EvL box held up to the camera",
    width: 450,
    height: 800,
  },
];
