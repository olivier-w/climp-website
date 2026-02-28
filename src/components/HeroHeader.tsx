import { useEffect, useState } from "react";

const GITHUB_REPO_URL = "https://github.com/olivier-w/climp";
const GITHUB_REPO_API_URL = "https://api.github.com/repos/olivier-w/climp";
const GITHUB_RELEASE_API_URL = "https://api.github.com/repos/olivier-w/climp/releases/latest";
const formatter = new Intl.NumberFormat("en-US");

type HeroHeaderProps = {
  initialStars?: number | null;
  initialVersion?: string | null;
};

const formatStars = (value: number) => formatter.format(value);

export default function HeroHeader({
  initialStars = null,
  initialVersion = null,
}: HeroHeaderProps) {
  const [stars, setStars] = useState<number | null>(initialStars);
  const [version, setVersion] = useState<string | null>(initialVersion);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRepoMeta = async () => {
      try {
        const [repoResult, releaseResult] = await Promise.allSettled([
          fetch(GITHUB_REPO_API_URL, {
            signal: controller.signal,
            headers: {
              Accept: "application/vnd.github+json",
            },
          }),
          fetch(GITHUB_RELEASE_API_URL, {
            signal: controller.signal,
            headers: {
              Accept: "application/vnd.github+json",
            },
          }),
        ]);

        if (repoResult.status === "fulfilled" && repoResult.value.ok) {
          const data: unknown = await repoResult.value.json();
          if (
            typeof data === "object" &&
            data !== null &&
            "stargazers_count" in data &&
            typeof data.stargazers_count === "number"
          ) {
            setStars(data.stargazers_count);
          }
        }

        if (releaseResult.status === "fulfilled" && releaseResult.value.ok) {
          const data: unknown = await releaseResult.value.json();
          if (
            typeof data === "object" &&
            data !== null &&
            "tag_name" in data &&
            typeof data.tag_name === "string"
          ) {
            setVersion(data.tag_name);
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    };

    void fetchRepoMeta();

    return () => {
      controller.abort();
    };
  }, []);

  const starsLabel =
    stars === null ? null : `View climp on GitHub (${formatStars(stars)} stars)`;

  return (
    <div className="w-full max-w-[540px] text-center space-y-2">
      <h1 className="text-xl text-balance">
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="climp-title"
        >
          climp
        </a>
        <span className="hero-version ml-1 text-sm text-text-muted opacity-40" aria-live="polite">
          {version ?? ""}
        </span>
      </h1>
      <p className="text-sm text-text-muted text-pretty">
        the cli media player nobody asked for.{" "}
        {stars !== null && (
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="github-stars-badge"
            aria-label={starsLabel ?? undefined}
          >
            {formatStars(stars)} &#9733;
          </a>
        )}
      </p>
    </div>
  );
}
