"use client";

import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

interface QuantityStepperProps {
  value: number;
  moq: number;
  stock?: number;
  onChange: (newQty: number) => void;
  className?: string;
}

export function QuantityStepper({
  value,
  moq,
  stock,
  onChange,
  className = "",
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (value <= moq) {
      toast.error(`Minimum order quantity is ${moq}`);
      return;
    }
    onChange(value - 1);
  };

  const handleIncrement = () => {
    if (stock && value >= stock) {
      toast.error(`Maximum available stock is ${stock}`);
      return;
    }
    onChange(value + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= moq) {
      if (!stock || val <= stock) {
        onChange(val);
      } else {
        toast.error(`Maximum available stock is ${stock}`);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (isNaN(val) || val < moq) {
      onChange(moq);
      toast.error(`Minimum order quantity is ${moq}`);
    }
  };

  return (
    <div
      className={`flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-2 py-1.5 ${className}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        className="p-1.5 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors disabled:opacity-40"
        disabled={value <= moq}
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>

      <div className="flex flex-col items-center min-w-[60px]">
        <input
          type="number"
          min={moq}
          max={stock || undefined}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="w-[60px] text-center text-sm font-semibold text-zinc-900 bg-transparent outline-none border-b border-zinc-300 focus:border-[#1d4ed8] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="Quantity"
        />
        <span className="text-[10px] text-zinc-400">units</span>
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        className="p-1.5 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
