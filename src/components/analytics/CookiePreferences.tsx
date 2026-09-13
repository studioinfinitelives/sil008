"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface CookiePreferencesProps {
  initialAnalyticsGranted: boolean;
  onCancel: () => void;
  onSave: (analyticsGranted: boolean) => void;
}

/**
 * The per-category "Customize" layer, reached from the banner and the footer.
 *
 * Essential storage is an always-on disabled toggle; analytics is the one real
 * choice. Transcribed from `showCookiePreferencesDialog` in the app, with the
 * essential row reworded for a site with no sign-in and no offline data.
 *
 * A native `<dialog>` driven by a ref rather than a dependency: it brings the
 * backdrop, focus trap and Escape-to-close for free, and `onClose` catches
 * every route out, including Escape, which never reaches the buttons.
 *
 * MOUNTED ONLY WHILE OPEN (`SiteAnalytics` renders it conditionally), so the
 * toggle seeds from the stored choice each time instead of needing to be
 * re-synchronised in an effect. A cancelled toggle cannot linger.
 */
export function CookiePreferences({
  initialAnalyticsGranted,
  onCancel,
  onSave,
}: CookiePreferencesProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [analytics, setAnalytics] = useState(initialAnalyticsGranted);

  // No cleanup needed: removing an open <dialog> from the document pops it off
  // the top layer, which is what unmounting does here.
  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      data-analytics="off"
      aria-labelledby="cookie-preferences-title"
      onClose={onCancel}
      className="bg-surface text-ink border-line m-auto w-[calc(100%-1.5rem)] max-w-md rounded-2xl border p-6 [&::backdrop]:bg-black/50"
    >
      <h2 id="cookie-preferences-title" className="text-lg font-bold">
        Cookie Preferences
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        <CategoryRow
          title="Essential"
          description="Required to serve this site and to remember your cookie choice. Always on."
          checked
          disabled
        />
        <CategoryRow
          title="Analytics"
          description="Google Analytics cookies that help us understand aggregate usage. Optional."
          checked={analytics}
          onChange={setAnalytics}
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(analytics)}>Save</Button>
      </div>
    </dialog>
  );
}

/** One category. Omitting `onChange` renders the locked-on Essential row. */
function CategoryRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        className="accent-brand mt-1 size-4 shrink-0"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span>
        <span className="text-ink block font-semibold">{title}</span>
        <span className="text-subtle block text-sm">{description}</span>
      </span>
    </label>
  );
}
