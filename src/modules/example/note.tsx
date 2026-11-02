import type { CustomCanvasRendererProps } from "../../renderer/custom-canvas-node.js";
import { t } from "../../renderer/i18n.js";

export function ExampleNote({ value, onChange }: CustomCanvasRendererProps) {
  return (
    <div className="nodrag nowheel">
      <label>
        {t("customCanvas.note")}
        <textarea
          aria-label={t("customCanvas.note")}
          value={String(value.text)}
          maxLength={4000}
          onChange={(event) => onChange({ ...value, text: event.target.value })}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.done === true}
          onChange={(event) =>
            onChange({ ...value, done: event.target.checked })
          }
        />
        {t("customCanvas.done")}
      </label>
    </div>
  );
}
