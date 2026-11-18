function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query) {
    return text;
  }

  const matcher = new RegExp(`(${escapeRegExp(query)})`, "gi");
  const matches = text.split(matcher);

  return matches.map((part, index) =>
    part.toLocaleLowerCase() === query.toLocaleLowerCase() ? (
      <mark className="rounded bg-yellow-200 px-0.5 text-slate-950" key={index}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
