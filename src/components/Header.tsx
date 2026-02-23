import logoVelox from "@/assets/logo-velox.png";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-[hsl(214,50%,10%)] border-b border-white/10">
      <div className="container flex items-center justify-center py-3">
        <a href="/">
          <img src={logoVelox} alt="Velox" className="h-8 sm:h-10 object-contain" />
        </a>
      </div>
    </header>
  );
};

export default Header;
