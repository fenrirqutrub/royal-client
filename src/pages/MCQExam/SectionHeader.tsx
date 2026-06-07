import { toBn } from "../../utility/Formatters";

export const SectionHeader = ({
  icon: Icon,
  title,
  count,
  pulse,
}: {
  icon: React.ElementType;
  title: string;
  count?: number;
  pulse?: boolean;
}) => (
  <div className="mb-3 flex items-center gap-2">
    {pulse ? (
      <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
    ) : (
      <Icon size={13} className="text-[var(--color-gray)]" />
    )}

    <h2 className="bangla text-xs font-bold uppercase tracking-wide text-[var(--color-text)]">
      {title}
    </h2>

    {typeof count === "number" && count > 0 && (
      <span className="bangla rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-2 py-0.5 text-[9px] font-bold text-[var(--color-gray)]">
        {toBn(count)}টি
      </span>
    )}
  </div>
);
