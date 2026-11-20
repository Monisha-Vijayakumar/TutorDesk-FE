import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { FeeFormSheetProps } from "@/interfaces/fees"
import { FeeForm } from "./FeeForm"

// Side panel for editing one month's payment details. Full width on phones.
// The content unmounts when it closes, so each open starts from the latest saved values.
export const FeeFormSheet = ({ isOpen, fee, onOpenChange, onFeesChanged }: FeeFormSheetProps) => {
  const closeSheet = (): void => onOpenChange(false)

  // Saved, or the student was deleted meanwhile: either way the list is out of date.
  const handleFeesChanged = (): void => {
    onFeesChanged()
    closeSheet()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        <SheetHeader className="border-b pr-12">
          <SheetTitle className="text-lg">Edit payment</SheetTitle>
          <SheetDescription>Update the fee and due date, or record a payment received.</SheetDescription>
        </SheetHeader>
        {fee && (
          <FeeForm
            key={fee.id}
            fee={fee}
            onSaved={handleFeesChanged}
            onCancel={closeSheet}
            onFeeNotFound={handleFeesChanged}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
