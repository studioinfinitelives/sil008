import { cdnUrl } from "@/lib/cdn";

/**
 * Photographs for the /teamevl turntable, in running order.
 *
 * Any length: the ring holds six cards and the rest queue behind it, so adding
 * a photograph here is the whole job. Ordered so the setting changes card to
 * card, since similar shots in a row read as a ring that failed to advance.
 *
 * FILENAMES ARE COINED HERE, not in `lib/cdn.ts`, because a photograph's name,
 * alt text and running order are one decision. `cdn.test.ts` reads this list,
 * so a name not present in `cdn/` still fails.
 *
 * Republished at 800px on the long edge. `next/image` is unoptimized, so that
 * is byte-for-byte what a visitor downloads. The immutable cache means a
 * recrop is a new filename here.
 */

export interface EvlPhoto {
  src: string;
  /**
   * What is happening, NEVER who is in it. These are identifiable people who
   * lent us their game night: describe the game, do not add names.
   */
  alt: string;
  /**
   * Size as uploaded, which is also the drawn size — the downscale baked any
   * EXIF orientation into the pixels, so there is no stored-versus-rendered
   * split to track.
   */
  width: number;
  height: number;
  /** `object-position` for the 3:4 crop, when centring cuts off a head. */
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
