const FooterSection = () => {
  return (
    <footer className="bg-gray-900 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-400 fade-up-slow">
          {/* Logo */}
          <div className="mb-4 flex justify-center zoom-in-fast">
            <img
              src="/logo2.png"
              alt="Agendux"
              className="h-10 w-auto opacity-80"
            />
          </div>
          <p className="fade-down-fast">&copy; 2026 Agendux. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
