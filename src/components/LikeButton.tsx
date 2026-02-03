import { useState, useEffect, useRef, useCallback } from "react";
import { ConvexProvider, ConvexReactClient, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL);

const PARTICLE_COUNT = 6;

function LikeButtonInner() {
  const count = useQuery(api.likes.get);
  const increment = useMutation(api.likes.increment);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("climp-liked") === "1") {
      setLiked(true);
    }
  }, []);
  const [animating, setAnimating] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const particleTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleClick = useCallback(() => {
    increment();
    setLiked(true);
    localStorage.setItem("climp-liked", "1");

    // Heart pop animation
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAnimating(true);
    timeoutRef.current = setTimeout(() => setAnimating(false), 500);

    // Particle burst
    if (particleTimeoutRef.current) clearTimeout(particleTimeoutRef.current);
    setParticles(Array.from({ length: PARTICLE_COUNT }, (_, i) => i));
    particleTimeoutRef.current = setTimeout(() => setParticles([]), 700);
  }, [increment]);

  return (
    <button
      className="like-button"
      onClick={handleClick}
      aria-label={`Like this project. ${count ?? 0} likes.`}
      data-animating={animating || undefined}
      data-liked={liked || undefined}
    >
      <span className="like-button-heart-wrap">
        <span className="like-button-heart">{liked ? "\u2665" : "\u2661"}</span>
        {particles.map((i) => (
          <span key={`${i}-${Date.now()}`} className="like-particle" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </span>
      <span className="like-button-count">{count ?? "..."}</span>
    </button>
  );
}

export default function LikeButton() {
  return (
    <ConvexProvider client={convex}>
      <LikeButtonInner />
    </ConvexProvider>
  );
}
