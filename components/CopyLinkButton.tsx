"use client";

import { useState } from "react";

export default function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}/join/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
    >
      {copied ? "Copied!" : "Copy student link"}
    </button>
  );
}
