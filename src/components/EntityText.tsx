import { memo } from "react";
import { highlightSegments } from "@/lib/entity-names";

/** Text se zářícími jmény entit z encyklopedie. */
export const EntityText = memo(function EntityText({ text, extra }: { text: string; extra?: string | undefined }) {
  return (
    <>
      {highlightSegments(text, extra).map((p, i) =>
        p.entity ? <mark key={i} className="entity-highlight">{p.text}</mark> : p.text,
      )}
    </>
  );
});
