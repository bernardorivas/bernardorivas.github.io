import type { IconName } from "@/components/icons";

export const profile = {
  name: "Bernardo Rivas",
  role: "Postdoctoral Fellow in Mathematics",
  affiliation: "University of Toledo",
  email: "bernardo.dopradorivas@utoledo.edu",
  // Rendered as a four-icon row the width of the portrait, under it. CV is not
  // here — it has its own slot in the nav on every page. ORCID is not here
  // either: it stays in the JSON-LD `sameAs` below, where it does its actual
  // work (machine-readable identity for funders, journals, and search),
  // without taking a slot in a row people click.
  links: [
    { label: "Email", href: "mailto:bernardo.dopradorivas@utoledo.edu", icon: "mail" },
    { label: "Google Scholar", href: "https://scholar.google.com/citations?user=qN522F4AAAAJ", icon: "scholar" },
    { label: "GitHub", href: "https://github.com/bernardorivas", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/bernardorivas-math", icon: "linkedin" },
  ] satisfies { label: string; href: string; icon: IconName }[],
  cvHref: "/files/cv.pdf",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Bernardo Rivas",
    url: "https://bernardorivas.github.io/",
    image: "https://bernardorivas.github.io/assets/profile.jpg",
    jobTitle: "Postdoctoral Fellow in Mathematics",
    email: "mailto:bernardo.dopradorivas@utoledo.edu",
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: "University of Toledo",
    },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Rutgers University" },
      { "@type": "CollegeOrUniversity", name: "Universidade de São Paulo" },
    ],
    sameAs: [
      "https://orcid.org/0009-0008-8603-0142",
      "https://scholar.google.com/citations?user=qN522F4AAAAJ",
      "https://github.com/bernardorivas",
      "https://www.linkedin.com/in/bernardorivas-math",
    ],
    knowsAbout: [
      "Nonlinear dynamics",
      "Combinatorial dynamics",
      "Computational topology",
      "Chaotic dynamics",
      "Conley index theory",
      "Hybrid dynamical systems",
      "Gene regulatory networks",
      "Rigorous computation",
    ],
  },
};
