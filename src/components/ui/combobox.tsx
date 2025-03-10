import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxItem {
  value: string;
  label: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
}

export function Combobox({
  items = [],
  value,
  onValueChange,
  placeholder = "Select an item...",
  emptyText = "No items found.",
  className,
  searchPlaceholder = "Search...",
  isLoading = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  if (isLoading) {
    return (
      <Button
        variant="outline"
        role="combobox"
        className={cn(
          "w-full justify-between h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm",
          "relative overflow-hidden",
          className
        )}
        disabled
      >
        <span className="text-gray-400 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
          Loading...
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200",
            "hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30",
            "bg-white/50 backdrop-blur-sm",
            "group",
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {value ? (
              <>
                <Check className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="truncate">
                  {items.find((item) => item.value === value)?.label}
                </span>
              </>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-hover:opacity-70 group-data-[state=open]:rotate-180" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 shadow-lg shadow-blue-900/5 border-gray-100 bg-white/95 backdrop-blur-xl"
        align="start"
      >
        <Command className="rounded-lg border-none">
          <div className="flex items-center border-b px-3 gap-2">
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-11 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
            />
          </div>
          <CommandList>
            <CommandEmpty className="py-6 text-sm text-center text-gray-500">
              {emptyText}
            </CommandEmpty>
            <CommandGroup className="p-2">
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => {
                    onValueChange(item.value);
                    setOpen(false);
                  }}
                  className="group rounded-md aria-selected:bg-blue-50 data-[selected=true]:bg-blue-50 aria-selected:text-blue-900 data-[selected=true]:text-blue-900 px-2 py-2"
                >
                  <span className="truncate">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
