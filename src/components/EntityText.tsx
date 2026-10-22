import { memo } from "react";
import { highlightSegments } from "@/lib/entity-names";

/** Text se zářícím cílovým jménem; bez jména vrací čistý text. */
export const EntityText = memo(function EntityText({ text, name }: { text: string; name?: string | undefined }) {
  if (!name) return <>{text}</>;
  return (
    <>
      {highlightSegments(text, [name]).map((p, i) =>
        p.entity ? <mark key={i} className="entity-highlight">{p.text}</mark> : p.text,
      )}
    </>
  );
});
