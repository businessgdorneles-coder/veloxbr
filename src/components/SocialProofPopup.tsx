import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const names = [
  "Carlos S.", "Fernanda M.", "João P.", "Ana L.", "Ricardo B.",
  "Juliana F.", "Pedro H.", "Mariana R.", "Lucas A.", "Camila T.",
  "Bruno G.", "Patrícia N.", "Rafael D.", "Larissa O.", "Gustavo V.",
  "Amanda C.", "Thiago E.", "Beatriz K.", "Diego W.", "Isabela Q.",
];

const cities = [
  "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG",
  "Curitiba, PR", "Porto Alegre, RS", "Salvador, BA",
  "Brasília, DF", "Fortaleza, CE", "Recife, PE", "Goiânia, GO",
  "Manaus, AM", "Florianópolis, SC", "Campinas, SP", "Vitória, ES",
];

const products = [
  "Kit Tapete Premium", "Kit Tapete + Porta-Malas", "Kit Tapete Completo",
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomMinutes(): number {
  return Math.floor(Math.random() * 30) + 1;
}

const SocialProofPopup = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({ name: "", city: "", product: "", minutes: 0 });

  useEffect(() => {
    const showPopup = () => {
      setData({
        name: getRandomItem(names),
        city: getRandomItem(cities),
        product: getRandomItem(products),
        minutes: getRandomMinutes(),
      });
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    const initialTimeout = setTimeout(showPopup, 5000);
    const interval = setInterval(showPopup, 12000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 max-w-xs bg-card border border-border rounded-xl shadow-2xl p-4 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div className="text-sm">
          <p className="font-semibold">{data.name}</p>
          <p className="text-muted-foreground text-xs">{data.city}</p>
          <p className="mt-1">
            Comprou <span className="font-semibold text-primary">{data.product}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">há {data.minutes} min atrás</p>
        </div>
      </div>
    </div>
  );
};

export default SocialProofPopup;
