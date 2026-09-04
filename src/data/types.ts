export interface PublicationLink { label: string; href: string; }
export interface Publication {
  id: string; title: string; url?: string;
  authors?: string;           // e.g. "B. Rivas, W. Kalies" — component highlights "B. Rivas"
  withAuthors?: string;       // in-prep only: collaborators after italic "With"
  venue?: React.ReactNode;    // may contain <em>; absent on in-preparation entries
  year?: string;
  arxivId?: string;
  links?: PublicationLink[];  // extra links (code, proceedings) after the arXiv id
}
export interface Talk { id: string; year: string; title: string; venue: string; }
export interface CourseLink { label: string; href: string; external?: boolean; } // external renders "↗", internal "→"
export interface Course { id: string; term: string; title: string; meta?: string; links?: CourseLink[]; }
export interface CourseGroup { title: string; courses: Course[]; }
export interface Project { id: string; name: string; role: "Author" | "Contributor"; description: string; link: { label: string; href: string }; }
