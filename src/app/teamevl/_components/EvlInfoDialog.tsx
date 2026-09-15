"use client";

import { Info, X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";

/**
 * An inline info icon that opens a modal footnote. Sits inside running copy,
 * so the trigger is a `<button>` sized to the text, not a block.
 *
 * `title` is REQUIRED: Radix warns without a `Dialog.Title`, and it is the
 * dialog's accessible name.
 */
export function EvlInfoDialog({
  label,
  title,
  children,
}: {
  /** The trigger's accessible name; the icon alone has none. */
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        aria-label={label}
        className="text-link hover:text-ink focus-visible:ring-brand ml-1 inline-flex cursor-pointer items-center rounded-full align-middle outline-none focus-visible:ring-2"
      >
        <Info aria-hidden className="size-5" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="bg-canvas border-line data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 fixed top-1/2 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-xl">
          <Dialog.Title className="text-ink pr-8 text-2xl font-black tracking-tight">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-subtle mt-3 text-lg">
            {children}
          </Dialog.Description>
          <Dialog.Close
            aria-label="Close"
            className="text-subtle hover:text-ink focus-visible:ring-brand absolute top-4 right-4 cursor-pointer rounded-full p-1 outline-none focus-visible:ring-2"
          >
            <X aria-hidden className="size-5" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
