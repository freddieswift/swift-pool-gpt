import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const [slug, setSlug] = useState("");
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    const normalized = slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (normalized) navigate(`/public/${normalized}`);
  }

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Built for competitive pool</p>
          <h1>Every fixture, frame and table in one place.</h1>
          <p>
            SwiftPool gives leagues a reliable home for scheduling, results,
            standings, player statistics and administration.
          </p>
          <form className="league-search" onSubmit={submit}>
            <label>
              League slug
              <input
                onChange={(event) => setSlug(event.target.value)}
                placeholder="city-pool-league"
                value={slug}
              />
            </label>
            <button className="button" type="submit">View league</button>
          </form>
        </div>
        <div className="hero-board" aria-hidden="true">
          <div className="score-panel">
            <span>Premier Division</span>
            <strong>7 — 5</strong>
            <small>Final score</small>
          </div>
          <div className="mini-table">
            <div><b>1</b><span>Break Masters</span><strong>18</strong></div>
            <div><b>2</b><span>Corner Kings</span><strong>16</strong></div>
            <div><b>3</b><span>Blackball Club</span><strong>13</strong></div>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <article><strong>Live standings</strong><p>Calculated directly from completed match results.</p></article>
        <article><strong>Captain workflows</strong><p>Structured result entry with roster and eligibility checks.</p></article>
        <article><strong>League operations</strong><p>Seasons, divisions, handicaps, sanctions and transitions.</p></article>
      </section>
    </div>
  );
}
