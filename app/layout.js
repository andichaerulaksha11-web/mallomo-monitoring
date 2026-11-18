import Nav from '../components/Nav';
import './globals.css';

export const metadata = { title: 'Monitoring Parkir Unit | PT. Mallomo' };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <header className="bar">
          <strong>Monitoring Parkir Unit · PT. Mallomo</strong>
          <Nav />
        </header>
        <main>{children}</main>
        <footer className="bar">Data: EasyGO GPS · Diperbarui otomatis tiap 1 menit</footer>
      </body>
    </html>
  );
}
