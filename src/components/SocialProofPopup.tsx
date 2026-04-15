import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const names = [
  "Carlos S.", "Fernanda M.", "João P.", "Ana L.", "Ricardo B.",
  "Juliana F.", "Pedro H.", "Mariana R.", "Lucas A.", "Camila T.",
  "Bruno G.", "Patrícia N.", "Rafael D.", "Larissa O.", "Gustavo V.",
];

const cities = [
  "São Paulo - SP", "Rio de Janeiro - RJ", "Belo Horizonte - MG",
  "Curitiba - PR", "Porto Alegre - RS", "Salvador - BA",
  "Brasília - DF", "Fortaleza - CE", "Recife - PE", "Goiânia - GO",
];

const products = [
  "Tapete Bandeja 3D • Honda Civic (2022) • Cor Preto",
  "Tapete Bandeja 3D • Toyota Corolla (2021) • Cor Cinza",
  "Tapete Bandeja 3D • Hyundai HB20 (2023) • Cor Bege",
  "Tapete Bandeja 3D • VW Polo (2022) • Cor Preto",
  "Tapete Bandeja 3D • Chevrolet Onix (2024) • Cor Cinza",
  "Tapete Bandeja 3D • Fiat Argo (2023) • Cor Preto",
  "Tapete Bandeja 3D • Jeep Compass (2022) • Cor Bege",
  "Tapete Bandeja 3D • Honda City (2019) • Cor Bege",
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SocialProofPopup = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({ name: "", city: "", product: "" });

  useEffect(() => {
    const showPopup = () => {
      setData({
        name: getRandomItem(names),
        city: getRandomItem(cities),
        product: getRandomItem(products),
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
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-white" />
        </div>
        <div className="text-sm">
          <h4 className="font-bold">{data.name}</h4>
          <p className="text-muted-foreground text-xs">
            de <strong>{data.city}</strong><br />
            comprou um <span className="font-semibold text-primary">{data.product}</span>
          </p>
          <p className="text-[0.7em] text-muted-foreground mt-1">Há instantes</p>
        </div>
      </div>
    </div>
  );
};

export default SocialProofPopup;
