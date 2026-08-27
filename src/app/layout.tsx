import "@/styles/globals.css";
import Nav from "@/components/Nav";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

// Verbatim from every $OLD page head: restores stored theme before paint.
const THEME_BOOTSTRAP =
  "try{var t=localStorage.getItem('br-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#faf9f5" />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Nav />
        <div className="shell">
          <Sidebar />
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
