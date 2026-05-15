import { useState } from "react";
import { motion } from "framer-motion";
import { CalculatorIcon, NotebookPen, Pencil } from "lucide-react";
import SelectInput from "../../components/common/SelectInput";
import Notepad from "./Notepad";
import Drawing from "./Drawing";
import Calculator from "./Calculator";

type ToolId = "calculator" | "notepad" | "drawing";

const TOOL_OPTIONS = [
  {
    value: "calculator",
    label: "ক্যালকুলেটর",
    icon: <CalculatorIcon size={14} />,
  },
  { value: "notepad", label: "নোটপ্যাড", icon: <NotebookPen size={14} /> },
  { value: "drawing", label: "ড্রইং", icon: <Pencil size={14} /> },
];

const ToolsTab = () => {
  const [selectedTool, setSelectedTool] = useState<ToolId | "">("calculator");
  const [isTouched, setIsTouched] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-6 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-6 flex items-end gap-3"
      >
        <div className="flex-1 max-w-xs">
          <SelectInput
            options={TOOL_OPTIONS}
            value={selectedTool}
            onChange={(v) => setSelectedTool(v as ToolId)}
            onBlur={() => setIsTouched(true)}
            placeholder="টুল বেছে নিন"
            isTouched={isTouched}
          />
        </div>
      </motion.div>
      <div className="rounded-lg border border-[var(--color-active-border)] bg-[var(--color-bg)] p-4">
        {selectedTool === "calculator" && <Calculator />}
        {selectedTool === "notepad" && <Notepad />}
        {selectedTool === "drawing" && <Drawing />}
      </div>
    </div>
  );
};

export default ToolsTab;
