export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          ⚽ PollaMundial 2026
        </div>
        <div className="footer-links">
          <a href="/" className="footer-link">Inicio</a>
          <a href="/ranking" className="footer-link">Ranking</a>
          <a href="/participants" className="footer-link">Participantes</a>
          <a href="/teams" className="footer-link">Equipos</a>
        </div>
        <div className="footer-copyright">
          Desarrollado por <a href="https://github.com/scamander90" target="_blank" rel="noopener noreferrer" className="footer-signature">@scamander90</a>
          &nbsp;— Todos los derechos reservados {year}
        </div>
      </div>
    </footer>
  );
}
