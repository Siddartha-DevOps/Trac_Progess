import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Loader2, 
  ChevronDown, 
  X, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";

// ============================================================================
// 1. TYPOGRAPHY
// ============================================================================

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5;
  variant?: "sans" | "display" | "mono";
  className?: string;
  children?: React.ReactNode;
}

export function Heading({ 
  level = 2, 
  variant = "sans", 
  className = "", 
  children, 
  ...props 
}: HeadingProps) {
  const fontClass = 
    variant === "display" 
      ? "font-sans tracking-tight font-black uppercase" 
      : variant === "mono" 
      ? "font-mono tracking-normal font-semibold" 
      : "font-sans tracking-tight font-extrabold";

  const sizeClasses = {
    1: "text-2xl md:text-3xl text-slate-900 leading-tight",
    2: "text-xl md:text-2xl text-slate-900 leading-snug",
    3: "text-lg md:text-xl text-slate-800 leading-normal",
    4: "text-base md:text-lg text-slate-800 leading-normal",
    5: "text-xs uppercase font-bold tracking-wider text-slate-500 font-mono"
  };

  const Tag = `h${level}` as const;

  return (
    <Tag 
      className={`${fontClass} ${sizeClasses[level]} ${className}`} 
      {...props}
    >
      {children}
    </Tag>
  );
}

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "muted" | "info" | "error" | "success" | "mono";
  weight?: "normal" | "medium" | "semibold" | "bold" | "black";
  className?: string;
  children?: React.ReactNode;
}

export function Text({ 
  size = "sm", 
  variant = "default", 
  weight = "normal", 
  className = "", 
  children, 
  ...props 
}: TextProps) {
  const sizeClasses = {
    xs: "text-[10px] md:text-xs leading-normal",
    sm: "text-xs md:text-sm leading-relaxed",
    md: "text-sm md:text-base leading-relaxed",
    lg: "text-base md:text-lg leading-relaxed"
  };

  const variantClasses = {
    default: "text-slate-700",
    muted: "text-slate-400 font-medium",
    info: "text-indigo-600",
    error: "text-rose-600",
    success: "text-emerald-600",
    mono: "font-mono text-slate-500 font-medium"
  };

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    black: "font-black"
  };

  return (
    <p 
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${weightClasses[weight]} ${className}`} 
      {...props}
    >
      {children}
    </p>
  );
}

// ============================================================================
// 2. BADGES / LABELS
// ============================================================================

export type BadgeVariant = "indigo" | "emerald" | "amber" | "rose" | "slate" | "sky" | "orange";
export type BadgeType = "solid" | "outline" | "soft";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  type?: BadgeType;
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ 
  variant = "slate", 
  type = "soft", 
  className = "", 
  children, 
  ...props 
}: BadgeProps) {
  const baseClass = "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide font-mono border transition";

  const typeClasses: Record<BadgeVariant, Record<BadgeType, string>> = {
    indigo: {
      solid: "bg-indigo-600 text-white border-indigo-700",
      outline: "bg-transparent text-indigo-600 border-indigo-200",
      soft: "bg-indigo-50 text-indigo-700 border-indigo-100/60"
    },
    emerald: {
      solid: "bg-emerald-600 text-white border-emerald-700",
      outline: "bg-transparent text-emerald-600 border-emerald-200",
      soft: "bg-emerald-50 text-emerald-700 border-emerald-100/60"
    },
    amber: {
      solid: "bg-amber-500 text-white border-amber-600",
      outline: "bg-transparent text-amber-600 border-amber-200",
      soft: "bg-amber-50 text-amber-700 border-amber-100/60"
    },
    rose: {
      solid: "bg-rose-600 text-white border-rose-700",
      outline: "bg-transparent text-rose-600 border-rose-200",
      soft: "bg-rose-50 text-rose-700 border-rose-100/60"
    },
    slate: {
      solid: "bg-slate-700 text-white border-slate-800",
      outline: "bg-transparent text-slate-700 border-slate-200",
      soft: "bg-slate-100 text-slate-700 border-slate-200/60"
    },
    sky: {
      solid: "bg-sky-600 text-white border-sky-700",
      outline: "bg-transparent text-sky-600 border-sky-200",
      soft: "bg-sky-50 text-sky-700 border-sky-100/60"
    },
    orange: {
      solid: "bg-orange-500 text-white border-orange-600",
      outline: "bg-transparent text-orange-600 border-orange-200",
      soft: "bg-orange-50 text-orange-700 border-orange-100/60"
    }
  };

  return (
    <span 
      className={`${baseClass} ${typeClasses[variant][type]} ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
}

// ============================================================================
// 3. BUTTONS
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseClass = "inline-flex items-center justify-center font-bold tracking-tight border rounded-lg transition-all focus:outline-none select-none cursor-pointer active:scale-98 disabled:opacity-50 disabled:pointer-events-none disabled:scale-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)]";

  const sizeClasses = {
    xs: "px-2 py-1 text-[10px] gap-1",
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs md:text-sm gap-2",
    lg: "px-5 py-2.5 text-sm md:text-base gap-2.5",
    xl: "px-6 py-3.5 text-base md:text-lg gap-3"
  };

  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700",
    secondary: "bg-slate-900 hover:bg-slate-800 text-white border-slate-900",
    outline: "bg-white hover:bg-slate-50 text-slate-700 border-slate-200",
    danger: "bg-rose-600 hover:bg-rose-700 text-white border-rose-700",
    ghost: "bg-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-transparent",
    link: "bg-transparent hover:underline text-indigo-600 border-transparent shadow-none p-0 inline font-semibold"
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}

// ============================================================================
// 4. INPUTS & FIELDS
// ============================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function Input({
  label,
  helperText,
  error,
  success,
  leftIcon,
  rightIcon,
  disabled,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Determine borders based on validation states
  let borderClass = "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100";
  if (error) borderClass = "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-50 bg-rose-50/10";
  else if (success) borderClass = "border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-50 bg-emerald-50/10";

  return (
    <div className="flex flex-col gap-1 w-full text-left" id={`${inputId}-wrapper`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-slate-700">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 shrink-0 select-none pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          className={`w-full bg-slate-50/40 rounded-lg p-2.5 text-xs md:text-sm outline-none transition-all placeholder-slate-400 text-slate-800 border ${borderClass} ${
            leftIcon ? "pl-10" : ""
          } ${rightIcon ? "pr-10" : ""} ${disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : ""}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 text-slate-400 shrink-0 select-none pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 font-mono">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          {error}
        </span>
      )}

      {success && !error && (
        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 font-mono">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          {success}
        </span>
      )}

      {helperText && !error && !success && (
        <span className="text-[10px] text-slate-400 font-medium font-mono leading-none">
          {helperText}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// 5. DROPDOWNS
// ============================================================================

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function Dropdown({
  options,
  value,
  onChange,
  label,
  placeholder = "Select Option",
  error,
  disabled = false
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1 w-full text-left relative" ref={containerRef} id={`dropdown-${value}`}>
      {label && <span className="text-xs font-bold text-slate-700">{label}</span>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50/40 border rounded-lg p-2.5 text-xs md:text-sm outline-none transition-all flex items-center justify-between gap-2 text-slate-800 ${
          error ? "border-rose-400 bg-rose-50/10" : "border-slate-200 focus:border-indigo-500"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={selectedOption ? "font-semibold" : "text-slate-400 font-normal"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {error && (
        <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 font-mono">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          {error}
        </span>
      )}

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute z-40 top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto overflow-x-hidden p-1 flex flex-col gap-0.5"
          >
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-2 rounded-lg text-xs md:text-sm flex items-center gap-2 transition cursor-pointer ${
                  option.value === value 
                    ? "bg-indigo-600 text-white font-bold" 
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.icon && (
                  <span className={`shrink-0 ${option.value === value ? "text-white" : "text-slate-400"}`}>
                    {option.icon}
                  </span>
                )}
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold">{option.label}</span>
                  {option.description && (
                    <span className={`text-[10px] ${option.value === value ? "text-indigo-200" : "text-slate-400"}`}>
                      {option.description}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// 6. CARDS
// ============================================================================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: "flat" | "low" | "normal" | "high";
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function Card({
  elevation = "normal",
  radius = "xl",
  header,
  footer,
  className = "",
  children,
  ...props
}: CardProps) {
  const elevationClasses = {
    flat: "border border-slate-200 bg-white",
    low: "border border-slate-200/80 bg-white shadow-xs",
    normal: "border border-slate-200 bg-white shadow-sm",
    high: "border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
  };

  const radiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl"
  };

  return (
    <div 
      className={`${elevationClasses[elevation]} ${radiusClasses[radius]} overflow-hidden text-left flex flex-col ${className}`} 
      {...props}
    >
      {header && (
        <div className="border-b border-slate-100 p-4 md:p-5 flex items-center justify-between">
          {header}
        </div>
      )}
      
      <div className="p-4 md:p-6 flex-1">
        {children}
      </div>

      {footer && (
        <div className="border-t border-slate-100 p-4 md:p-5 bg-slate-50/50">
          {footer}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 7. TABLES
// ============================================================================

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  striped?: boolean;
  hoverable?: boolean;
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
}

export function Table<T extends { id: string | number }>({
  columns,
  data,
  striped = false,
  hoverable = true,
  isLoading = false,
  pagination
}: TableProps<T>) {
  const totalPages = pagination ? Math.ceil(pagination.totalCount / pagination.pageSize) : 0;

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="border border-slate-200 rounded-xl overflow-x-auto overflow-y-hidden shadow-xs bg-white">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono select-none">
              {columns.map((col, index) => (
                <th key={index} className={`p-4 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <span className="text-xs text-slate-400 font-bold font-mono">Retrieving live ledger rows...</span>
                  </div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr 
                  key={row.id} 
                  className={`transition-colors ${
                    striped && rowIndex % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                  } ${hoverable ? "hover:bg-slate-50/60" : ""}`}
                >
                  {columns.map((col, colIndex) => {
                    const content = typeof col.accessor === "function" 
                      ? col.accessor(row) 
                      : (row[col.accessor] as React.ReactNode);

                    return (
                      <td key={colIndex} className={`p-4 font-semibold text-slate-700 ${col.className || ""}`}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center text-slate-400 font-bold">
                  No records matching search query parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-2 select-none">
          <span className="font-mono font-bold">
            Showing Page <span className="text-slate-800">{pagination.currentPage}</span> of <span className="text-slate-800">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="xs"
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={pagination.currentPage === totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 8. DIALOGS & MODALS
// ============================================================================

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footerActions,
  maxWidth = "md"
}: DialogProps) {
  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.38 }}
            className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-xl w-full ${widthClasses[maxWidth]} relative z-10 flex flex-col gap-4 text-left`}
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <Heading level={3} className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse shrink-0" />
                  {title}
                </Heading>
                {description && (
                  <p className="text-[10px] text-slate-400 font-medium font-mono leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              <button 
                onClick={onClose} 
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 py-1 text-xs text-slate-600">
              {children}
            </div>

            {footerActions && (
              <div className="border-t border-slate-100 pt-4 flex gap-3 justify-end items-center">
                {footerActions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// 9. DRAWERS
// ============================================================================

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  position?: "left" | "right";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = "right"
}: DrawerProps) {
  const isRight = position === "right";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: isRight ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRight ? "100%" : "-100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
            className={`absolute top-0 bottom-0 ${
              isRight ? "right-0 border-l" : "left-0 border-r"
            } bg-white border-slate-200 shadow-2xl w-full max-w-md z-10 flex flex-col h-full`}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start shrink-0">
              <div className="space-y-0.5">
                <Heading level={3} className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  {title}
                </Heading>
                {description && (
                  <p className="text-[10px] text-slate-400 font-medium font-mono leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              <button 
                onClick={onClose} 
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-600 scrollbar-thin">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// 10. SKELETONS
// ============================================================================

interface SkeletonProps {
  variant?: "text" | "rect" | "circle" | "card";
  height?: string;
  width?: string;
  className?: string;
}

export function Skeleton({
  variant = "rect",
  height,
  width,
  className = ""
}: SkeletonProps) {
  const baseClass = "bg-slate-250 animate-pulse rounded";

  const variantClasses = {
    text: "h-3 w-5/6 rounded-sm my-1",
    rect: "h-12 w-full rounded-md",
    circle: "h-10 w-10 rounded-full",
    card: "h-36 w-full rounded-xl"
  };

  const customStyles: React.CSSProperties = {
    ...(height && { height }),
    ...(width && { width })
  };

  return (
    <div 
      style={customStyles}
      className={`${baseClass} ${variantClasses[variant]} ${className}`} 
    />
  );
}

// ============================================================================
// 11. EMPTY STATES
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center p-8 border border-dashed border-slate-200 rounded-xl bg-white/40 shadow-xs max-w-md mx-auto my-6 animate-fade-in">
      <div className="w-12 h-12 bg-slate-100/80 rounded-xl flex items-center justify-center text-slate-400 mb-4 border border-slate-200/50">
        {icon || <Search className="w-6 h-6" />}
      </div>
      
      <Heading level={3} className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">
        {title}
      </Heading>
      
      <p className="text-xs text-slate-400 leading-relaxed font-semibold mb-5 px-3">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
