import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "../ui/utils";

interface OptionCardProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  multi?: boolean;
  icon?: React.ReactNode;
}

export function OptionCard({ label, selected, onClick, multi, icon }: OptionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full p-5 rounded-2xl border-2 text-left font-semibold text-lg transition-all duration-300 flex items-center justify-between gap-4",
        selected
          ? "border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-900 shadow-lg"
          : "border-orange-100 bg-white/80 text-gray-800 hover:border-orange-300 hover:shadow-md",
      )}
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center"
        >
          <Check className="w-5 h-5 text-white" />
        </motion.span>
      )}
      {multi && !selected && (
        <span className="w-8 h-8 rounded-full border-2 border-orange-200 flex-shrink-0" />
      )}
    </motion.button>
  );
}
