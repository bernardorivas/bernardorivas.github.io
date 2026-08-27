import FooterYear from "@/components/FooterYear";

// Contact lives in the icon row under the landing panel and the theme control
// lives in the nav, so the footer carries only the copyright line.
export default function Footer() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <span>© <FooterYear /> Bernardo Rivas</span>
      </div>
    </footer>
  );
}
