export type TechnologyPortfolioFilter = "all" | "active" | "archived";

export type TechnologyPortfolioLink = {
  application_id: string;
  technology: { id: string; name: string };
  application: {
    id: string;
    job_title: string;
    archived_at: string | null;
    company: { name: string };
  };
};

export type TechnologyPortfolioItem = {
  id: string;
  name: string;
  applications: Array<{
    id: string;
    jobTitle: string;
    companyName: string;
  }>;
};

export type TechnologyPortfolioSummary = {
  technologies: number;
  links: number;
  activeApplications: number;
  topTechnology: string | null;
};
