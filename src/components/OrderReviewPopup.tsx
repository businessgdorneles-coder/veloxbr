import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface OrderReviewPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleType: string;
  brand: string;
  model: string;
  year: string;
  selectedColor: string;
  selectedKit: "interno" | "completo";
}

const OrderReviewPopup = ({
  open,
  onOpenChange,
  vehicleType,
  brand,
  model,
  year,
  selectedColor,
  selectedKit,
}: OrderReviewPopupProps) => {
  const navigate = useNavigate();
  

  const summaryRows = [
    { label: "Marca", value: brand },
    { label: "Modelo", value: model },
    { label: "Ano", value: year },
    { label: "Tipo", value: vehicleType ? (vehicleType === "carro" ? "Carro" : "Caminhão") : "" },
    { label: "Cor", value: selectedColor !== "Preto" && selectedColor !== "Cinza" && selectedColor !== "Bege" ? "" : selectedColor },
    { label: "Kit", value: selectedKit === "completo" ? "Com porta-malas" : "Sem porta-malas" },
    
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">
        <div className="p-6 pb-4">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-2xl font-bold">Revise seu pedido</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-1">
              Seu kit será enviado para fabricação sob medida. Confira os detalhes antes de prosseguir.
            </DialogDescription>
          </DialogHeader>
        </div>


        {/* Summary Table */}
        <div className="mx-6 mb-4 p-4 rounded-xl border border-border bg-muted/30">
          {summaryRows.map((row, i) => (
            <div
              key={row.label}
              className={`flex justify-between items-center py-3 ${
                i < summaryRows.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="text-sm font-bold">
                {row.value || "Não informado"}
              </span>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="text-center py-3 text-sm text-muted-foreground">
          Arraste para ver mais ↓
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full border-2 border-border rounded-xl py-3.5 font-bold text-sm hover:bg-muted transition-all"
          >
            Voltar e ajustar
          </button>
          <button
            onClick={() => {
              onOpenChange(false);
              navigate("/checkout", {
                state: {
                  brand,
                  model,
                  year,
                  vehicleType,
                  selectedColor,
                  selectedKit,
                  
                },
              });
            }}
            className="w-full bg-success text-primary-foreground font-bold py-4 rounded-xl text-base shadow-lg hover:brightness-110 transition-all"
          >
            Ir para pagamento
          </button>
          <p className="text-xs text-muted-foreground text-center">
            🔒 Pagamento 100% seguro • Ambiente protegido
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderReviewPopup;
