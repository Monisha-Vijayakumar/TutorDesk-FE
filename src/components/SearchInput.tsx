import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SearchInputProps } from "@/interfaces/filters"
import { cn } from "@/lib/utils"

// Labelled search box with a search icon and a clear (×) button. Same height as the other inputs.
export const SearchInput = ({ id, label, placeholder, value, onValueChange, className }: SearchInputProps) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          type="search"
          className="h-10 pr-10 pl-8 md:h-9 [&::-webkit-search-cancel-button]:hidden"
          placeholder={placeholder}
          autoComplete="off"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 size-10 md:size-9"
            onClick={() => onValueChange("")}
            aria-label="Clear search"
          >
            <X />
          </Button>
        )}
      </div>
    </div>
  )
}
