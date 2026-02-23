import { useEffect, useState } from "react";

const GITHUB_REPO_URL = "https://github.com/olivier-w/climp";
const GITHUB_REPO_API_URL = "https://api.github.com/repos/olivier-w/climp";
const formatter = new Intl.NumberFormat("en-US");

type GitHubStarsBadgeProps = {
  initialStars?: number | null;
};

const formatStars = (value: number) => formatter.format(value);

export default function GitHubStarsBadge({ initialStars = null }: GitHubStarsBadgeProps) {
  const [stars, setStars] = useState<number | null>(initialStars);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStars = async () => {
      try {
        const response = await fetch(GITHUB_REPO_API_URL, {
          signal: controller.signal,
          headers: {
            Accept: "application/vnd.github+json",
          },
        });

        if (!response.ok) {
          return;
        }

        const data: unknown = await response.json();
        if (
          typeof data === "object" &&
          data !== null &&
          "stargazers_count" in data &&
          typeof data.stargazers_count === "number"
        ) {
          setStars(data.stargazers_count);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    };

    void fetchStars();

    return () => {
      controller.abort();
    };
  }, []);

  const accessibleLabel = stars !== null
    ? `View climp on GitHub (${formatStars(stars)} stars)`
    : "View climp on GitHub";

  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="github-stars-badge"
      aria-label={accessibleLabel}
    >
      <span className="github-stars-badge__star" aria-hidden="true">&#9733;</span>
      <span className="github-stars-badge__count">{stars !== null ? formatStars(stars) : "..."}</span>
      <span className="github-stars-badge__sep" aria-hidden="true">&middot;</span>
      <span className="github-stars-badge__label">GitHub</span>
    </a>
  );
}
