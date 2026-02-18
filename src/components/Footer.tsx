const Footer = () => {
  return (
    <footer className="bg-hero-dark py-10 text-hero-foreground/60">
      <div className="container text-center">
        <p className="font-display text-lg font-bold text-hero-foreground mb-2">
          <span className="text-gradient-blue">CARPET</span>CAR
        </p>
        <p className="text-xs mb-4">Tapetes automotivos premium sob medida</p>
        <p className="text-xs">&copy; {new Date().getFullYear()} CarpetCar. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
