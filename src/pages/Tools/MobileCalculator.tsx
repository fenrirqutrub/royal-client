import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Delete,
  Clock,
  Trash2,
  ChevronUp,
  Divide,
  X,
  Minus,
  Plus,
  Equal,
  Percent,
  Pi,
  Radical,
  Superscript,
  FlipVertical,
  Parentheses,
  History,
  Calculator,
  Sigma,
  Dot,
} from "lucide-react";
import { FaPlusMinus } from "react-icons/fa6";

type Operator = "+" | "-" | "×" | "÷" | "%" | "^";

interface HistoryEntry {
  expression: string;
  result: string;
  timestamp: number;
}

interface CalcState {
  display: string;
  expression: string;
  operator: Operator | null;
  prevValue: number | null;
  waitingForOperand: boolean;
  justEvaluated: boolean;
  lastOperand: number | null;
  lastOperator: Operator | null;
  openBrackets: number;
}

const INITIAL: CalcState = {
  display: "0",
  expression: "",
  operator: null,
  prevValue: null,
  waitingForOperand: false,
  justEvaluated: false,
  lastOperand: null,
  lastOperator: null,
  openBrackets: 0,
};

const evaluate = (a: number, b: number, op: Operator): number => {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b !== 0 ? a / b : NaN;
    case "%":
      return a % b;
    case "^":
      return Math.pow(a, b);
  }
};

const format = (n: number): string => {
  if (isNaN(n)) return "Error";
  if (!isFinite(n)) return "∞";
  if (Number.isInteger(n) && Math.abs(n) < 1e12) return n.toString();
  const str = parseFloat(n.toPrecision(10)).toString();
  return str.length > 12 ? parseFloat(n.toPrecision(7)).toExponential() : str;
};

const HISTORY_KEY = "calc_history_v4";

const loadHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
};

const saveHistory = (h: HistoryEntry[]): void => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 50)));
  } catch {
    /* silent */
  }
};

type BtnVariant = "operator" | "function" | "equals" | "number" | "scientific";

interface ButtonConfig {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  variant: BtnVariant;
  wide?: boolean;
}

const MobileCalculator: React.FC = () => {
  const [calc, setCalc] = useState<CalcState>(INITIAL);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [showScientific, setShowScientific] = useState(false);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const addToHistory = useCallback(
    (expression: string, result: string): void => {
      setHistory((prev) => [
        { expression, result, timestamp: Date.now() },
        ...prev,
      ]);
    },
    [],
  );

  const clearHistory = useCallback((): void => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  const inputDigit = useCallback((digit: string): void => {
    setCalc((prev) => {
      if (prev.waitingForOperand || prev.justEvaluated) {
        return {
          ...prev,
          display: digit,
          waitingForOperand: false,
          justEvaluated: false,
        };
      }
      if (prev.display === "0" && digit === "0") return prev;
      const next =
        prev.display === "0"
          ? digit
          : prev.display.length < 15
            ? prev.display + digit
            : prev.display;
      return { ...prev, display: next };
    });
  }, []);

  const inputDecimal = useCallback((): void => {
    setCalc((prev) => {
      if (prev.waitingForOperand || prev.justEvaluated)
        return {
          ...prev,
          display: "0.",
          waitingForOperand: false,
          justEvaluated: false,
        };
      if (prev.display.includes(".")) return prev;
      return { ...prev, display: prev.display + "." };
    });
  }, []);

  const toggleSign = useCallback((): void => {
    setCalc((prev) => {
      if (prev.display === "0") return prev;
      return { ...prev, display: format(parseFloat(prev.display) * -1) };
    });
  }, []);

  const percentCalc = useCallback((): void => {
    setCalc((prev) => {
      const current = parseFloat(prev.display);
      if (prev.prevValue !== null && prev.operator) {
        return {
          ...prev,
          display: format(prev.prevValue * (current / 100)),
          justEvaluated: false,
        };
      }
      return { ...prev, display: format(current / 100), justEvaluated: true };
    });
  }, []);

  const clear = useCallback((): void => setCalc(INITIAL), []);

  const backspace = useCallback((): void => {
    setCalc((prev) => {
      if (prev.justEvaluated || prev.waitingForOperand) return INITIAL;
      return {
        ...prev,
        display: prev.display.length > 1 ? prev.display.slice(0, -1) : "0",
      };
    });
  }, []);

  const setOperator = useCallback((op: Operator): void => {
    setCalc((prev) => {
      const current = parseFloat(prev.display);
      if (prev.waitingForOperand) {
        return {
          ...prev,
          operator: op,
          expression: `${prev.prevValue !== null ? format(prev.prevValue) : prev.display} ${op}`,
        };
      }
      if (prev.operator && prev.prevValue !== null && !prev.justEvaluated) {
        const result = evaluate(prev.prevValue, current, prev.operator);
        return {
          ...prev,
          display: format(result),
          expression: `${format(result)} ${op}`,
          prevValue: result,
          operator: op,
          waitingForOperand: true,
          justEvaluated: false,
        };
      }
      return {
        ...prev,
        expression: `${prev.display} ${op}`,
        prevValue: current,
        operator: op,
        waitingForOperand: true,
        justEvaluated: false,
      };
    });
  }, []);

  const equate = useCallback((): void => {
    setCalc((prev) => {
      if (
        prev.justEvaluated &&
        prev.lastOperator &&
        prev.lastOperand !== null
      ) {
        const current = parseFloat(prev.display);
        const result = evaluate(current, prev.lastOperand, prev.lastOperator);
        const expr = `${prev.display} ${prev.lastOperator} ${format(prev.lastOperand)}`;
        addToHistory(expr, format(result));
        return {
          ...prev,
          display: format(result),
          expression: `${expr} =`,
          prevValue: result,
        };
      }
      if (!prev.operator || prev.prevValue === null) return prev;
      const current = parseFloat(prev.display);
      const result = evaluate(prev.prevValue, current, prev.operator);
      const expr = `${prev.expression} ${prev.display}`;
      addToHistory(expr, format(result));
      return {
        ...INITIAL,
        display: format(result),
        expression: `${expr} =`,
        justEvaluated: true,
        lastOperand: current,
        lastOperator: prev.operator,
      };
    });
  }, [addToHistory]);

  const applyFunction = useCallback(
    (fn: (n: number) => number, label: string): void => {
      setCalc((prev) => {
        const val = parseFloat(prev.display);
        const result = fn(val);
        const expr = `${label}(${prev.display})`;
        addToHistory(expr, format(result));
        return {
          ...prev,
          display: format(result),
          expression: expr,
          justEvaluated: true,
          waitingForOperand: false,
        };
      });
    },
    [addToHistory],
  );

  const insertConstant = useCallback((value: number): void => {
    setCalc((prev) => ({
      ...prev,
      display: format(value),
      justEvaluated: true,
      waitingForOperand: false,
    }));
  }, []);

  const insertBracket = useCallback((): void => {
    setCalc((prev) => {
      if (prev.openBrackets === 0)
        return {
          ...prev,
          openBrackets: 1,
          expression: prev.expression + " (",
          display: "0",
          waitingForOperand: true,
        };
      return {
        ...prev,
        openBrackets: 0,
        expression: prev.expression + ` ${prev.display})`,
      };
    });
  }, []);

  const isActiveOp = (op: string): boolean =>
    calc.operator === op && calc.waitingForOperand;

  const displayFontSize =
    calc.display.length > 12
      ? "text-3xl"
      : calc.display.length > 9
        ? "text-4xl"
        : calc.display.length > 7
          ? "text-5xl"
          : "text-6xl";

  const scientificButtons: ButtonConfig[] = [
    {
      label: "sin",
      action: () => applyFunction(Math.sin, "sin"),
      variant: "scientific",
    },
    {
      label: "cos",
      action: () => applyFunction(Math.cos, "cos"),
      variant: "scientific",
    },
    {
      label: "tan",
      action: () => applyFunction(Math.tan, "tan"),
      variant: "scientific",
    },
    {
      label: "log",
      action: () => applyFunction(Math.log10, "log"),
      variant: "scientific",
    },
    {
      label: "ln",
      action: () => applyFunction(Math.log, "ln"),
      variant: "scientific",
    },
    {
      label: "√",
      icon: <Radical size={16} />,
      action: () => applyFunction(Math.sqrt, "√"),
      variant: "scientific",
    },
    {
      label: "x²",
      icon: <Superscript size={16} />,
      action: () => applyFunction((n) => n * n, "sqr"),
      variant: "scientific",
    },
    {
      label: "x!",
      icon: <Sigma size={16} />,
      action: () =>
        applyFunction((n) => {
          if (n < 0 || n > 170 || n % 1 !== 0) return NaN;
          let r = 1;
          for (let i = 2; i <= n; i++) r *= i;
          return r;
        }, "fact"),
      variant: "scientific",
    },
    {
      label: "π",
      icon: <Pi size={16} />,
      action: () => insertConstant(Math.PI),
      variant: "scientific",
    },
    { label: "e", action: () => insertConstant(Math.E), variant: "scientific" },
    {
      label: "()",
      icon: <Parentheses size={16} />,
      action: insertBracket,
      variant: "scientific",
    },
    { label: "xʸ", action: () => setOperator("^"), variant: "scientific" },
    {
      label: "1/x",
      icon: <FlipVertical size={16} />,
      action: () => applyFunction((n) => 1 / n, "1/"),
      variant: "scientific",
    },
    {
      label: "log₂",
      action: () => applyFunction(Math.log2, "log₂"),
      variant: "scientific",
    },
    {
      label: "|x|",
      action: () => applyFunction(Math.abs, "abs"),
      variant: "scientific",
    },
    {
      label: "10ˣ",
      action: () => applyFunction((n) => Math.pow(10, n), "10^"),
      variant: "scientific",
    },
  ];

  const mainButtons: ButtonConfig[][] = [
    [
      { label: "AC", action: clear, variant: "function" },
      {
        label: "+/-",
        icon: <FaPlusMinus size={20} />,
        action: toggleSign,
        variant: "function",
      },
      {
        label: "%",
        icon: <Percent size={22} />,
        action: percentCalc,
        variant: "function",
      },
      {
        label: "÷",
        icon: <Divide size={26} />,
        action: () => setOperator("÷"),
        variant: "operator",
      },
    ],
    [
      { label: "7", action: () => inputDigit("7"), variant: "number" },
      { label: "8", action: () => inputDigit("8"), variant: "number" },
      { label: "9", action: () => inputDigit("9"), variant: "number" },
      {
        label: "×",
        icon: <X size={26} />,
        action: () => setOperator("×"),
        variant: "operator",
      },
    ],
    [
      { label: "4", action: () => inputDigit("4"), variant: "number" },
      { label: "5", action: () => inputDigit("5"), variant: "number" },
      { label: "6", action: () => inputDigit("6"), variant: "number" },
      {
        label: "-",
        icon: <Minus size={26} />,
        action: () => setOperator("-"),
        variant: "operator",
      },
    ],
    [
      { label: "1", action: () => inputDigit("1"), variant: "number" },
      { label: "2", action: () => inputDigit("2"), variant: "number" },
      { label: "3", action: () => inputDigit("3"), variant: "number" },
      {
        label: "+",
        icon: <Plus size={26} />,
        action: () => setOperator("+"),
        variant: "operator",
      },
    ],
    [
      {
        label: "0",
        action: () => inputDigit("0"),
        variant: "number",
        wide: true,
      },
      {
        label: ".",
        icon: <Dot size={26} />,
        action: inputDecimal,
        variant: "number",
      },
      {
        label: "=",
        icon: <Equal size={26} />,
        action: equate,
        variant: "equals",
      },
    ],
  ];

  const formatTime = (ts: number): string => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getVariantClasses = (variant: BtnVariant, label: string): string => {
    if (isActiveOp(label))
      return "bg-[var(--color-text)] text-[var(--color-bg)] shadow-lg";
    switch (variant) {
      case "function":
        return "bg-[var(--color-active-bg)] text-[var(--color-gray)] border border-[var(--color-active-border)] hover:text-[var(--color-text)] hover:bg-[var(--color-active-border)]";
      case "operator":
        return "bg-amber-500 text-white shadow-md shadow-amber-500/20 hover:bg-amber-400 active:bg-amber-600";
      case "equals":
        return "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:bg-emerald-600";
      case "number":
        return "bg-[var(--color-active-bg)] text-[var(--color-text)] border border-[var(--color-active-border)] hover:bg-[var(--color-active-border)]";
      case "scientific":
        return "bg-[var(--color-active-bg)] text-[var(--color-active-text)] border border-[var(--color-active-border)] hover:bg-[var(--color-active-border)]";
    }
  };

  return (
    <div className="w-full select-none bg-[var(--color-bg)]">
      {/* Top bar */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowScientific(!showScientific)}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--color-gray)] hover:text-[var(--color-text)] hover:bg-[var(--color-active-bg)] transition-all"
        >
          <motion.div
            animate={{ rotate: showScientific ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {showScientific ? (
              <Calculator size={14} />
            ) : (
              <ChevronUp size={14} />
            )}
          </motion.div>
          <span>{showScientific ? "Basic" : "Sci"}</span>
        </motion.button>

        <div className="flex items-center">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={backspace}
            className="rounded-full p-2 text-[var(--color-gray)] hover:text-[var(--color-text)] hover:bg-[var(--color-active-bg)] transition-all"
          >
            <Delete size={18} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setShowHistory(!showHistory)}
            className="relative rounded-full p-2 text-[var(--color-gray)] hover:text-[var(--color-text)] hover:bg-[var(--color-active-bg)] transition-all"
          >
            <History size={18} />
            {history.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full bg-amber-500 text-white flex items-center justify-center font-bold leading-none px-0.5"
                style={{ fontSize: "8px" }}
              >
                {history.length > 9 ? "9+" : history.length}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>

      {/* History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="mx-2 mb-2 rounded-2xl bg-[var(--color-active-bg)] border border-[var(--color-active-border)] max-h-48 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-active-border)] shrink-0">
                <div className="flex items-center gap-2">
                  <Clock size={11} className="text-[var(--color-gray)]" />
                  <span className="text-[10px] font-semibold text-[var(--color-gray)] tracking-widest uppercase">
                    History
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={clearHistory}
                      className="flex items-center gap-1 text-[10px] text-[var(--color-gray)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={11} />
                      <span>Clear</span>
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowHistory(false)}
                    className="text-[var(--color-gray)] hover:text-[var(--color-text)] transition-colors p-0.5 rounded-full hover:bg-[var(--color-active-bg)]"
                  >
                    <X size={13} />
                  </motion.button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {history.length === 0 ? (
                  <div className="px-3 py-8 text-center">
                    <Clock
                      size={18}
                      className="mx-auto mb-2 text-[var(--color-gray)] opacity-50"
                    />
                    <p className="text-[11px] text-[var(--color-gray)]">
                      No calculations yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--color-active-border)]">
                    {history.map((entry, i) => (
                      <motion.button
                        key={`${entry.timestamp}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => {
                          setCalc((prev) => ({
                            ...prev,
                            display: entry.result,
                            justEvaluated: true,
                          }));
                          setShowHistory(false);
                        }}
                        className="w-full px-3 py-2.5 text-right hover:bg-[var(--color-active-bg)] transition-all group"
                      >
                        <p className="text-[9px] text-[var(--color-gray)] truncate group-hover:text-[var(--color-text)] transition-colors font-mono">
                          {formatTime(entry.timestamp)} · {entry.expression}
                        </p>
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate mt-0.5">
                          = {entry.result}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Display */}
      <div className="px-4 pt-4 pb-5 min-h-[110px] flex flex-col justify-end">
        <motion.p
          layout="position"
          className="text-right text-sm text-[var(--color-gray)] truncate font-light tracking-wide mb-2"
        >
          {calc.expression || "\u00A0"}
        </motion.p>
        <AnimatePresence mode="popLayout">
          <motion.p
            key={calc.display}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className={`text-right font-extralight text-[var(--color-text)] leading-none truncate tracking-tight ${displayFontSize}`}
          >
            {calc.display}
          </motion.p>
        </AnimatePresence>
        {calc.openBrackets > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-end mt-2"
          >
            <span className="text-[10px] bg-amber-500/15 text-amber-500 rounded-full px-2 py-0.5 font-semibold border border-amber-500/20">
              {calc.openBrackets} open
            </span>
          </motion.div>
        )}
      </div>

      {/* Divider */}
      <div className="">
        <div className="h-px bg-[var(--color-active-border)]" />
      </div>

      {/* Scientific */}
      <AnimatePresence>
        {showScientific && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="p-2 pt-3">
              <div className="grid grid-cols-4 gap-[6px]">
                {scientificButtons.map((btn, i) => (
                  <motion.button
                    key={btn.label}
                    initial={{ opacity: 0, scale: 0.7, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{
                      delay: i * 0.015,
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                    }}
                    whileTap={{ scale: 0.88 }}
                    onClick={btn.action}
                    className={`flex items-center justify-center rounded-full text-xs font-semibold h-12 transition-all duration-150 ${getVariantClasses(btn.variant, btn.label)}`}
                  >
                    {btn.icon ?? btn.label}
                  </motion.button>
                ))}
              </div>
              <div className="flex justify-center pt-2 pb-0.5">
                <div className="w-10 h-0.5 rounded-full bg-[var(--color-active-border)]" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Buttons */}
      <div className="p-2 pt-3 flex flex-col gap-[6px]">
        {mainButtons.map((row, ri) => (
          <motion.div
            key={ri}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: ri * 0.04,
              type: "spring",
              stiffness: 400,
              damping: 28,
            }}
            className="grid gap-[6px]"
            style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
          >
            {row.map((btn) => (
              <motion.button
                key={btn.label}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                onClick={btn.action}
                className={[
                  "relative flex items-center justify-center text-2xl font-medium transition-all duration-150",
                  btn.wide
                    ? "col-span-2 rounded-full h-[72px] px-8 justify-start"
                    : "rounded-full h-[72px]",
                  getVariantClasses(btn.variant, btn.label),
                ].join(" ")}
              >
                <span className="relative z-10">{btn.icon ?? btn.label}</span>
              </motion.button>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MobileCalculator;
