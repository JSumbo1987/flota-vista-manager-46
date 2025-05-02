
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

interface DateSelectorProps {
  label: string;
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disablePastDates?: boolean;
  required?: boolean;
}

const DateSelector = ({
  label,
  selected,
  onSelect,
  disablePastDates,
  required = false,
}: DateSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}{required && "*"}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {selected
              ? format(selected, "dd/MM/yyyy")
              : "Selecione uma data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={selected}
            onSelect={onSelect}
            initialFocus
            locale={ptBR}
            disabled={disablePastDates ? (date) => date < new Date() : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateSelector;
