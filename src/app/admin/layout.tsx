import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "../globals.css";

export const metadata = {
  title: "Intervo Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
