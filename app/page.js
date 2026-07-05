import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <p className="eyebrow">LifeLink</p>
      <h1>Who's using LifeLink today?</h1>
      <p className="lead">Tell us why you're here so we can take you to the right place.</p>

      <div className="choice-grid">
        <Link href="/donor/login" className="choice-btn">
          <div className="title">I'm a donor</div>
          <div className="desc">Create or update your profile, and get matched to nearby requests.</div>
        </Link>

        <Link href="/patient/request" className="choice-btn patient">
          <div className="title">I need blood urgently</div>
          <div className="desc">Request blood and get matched to the nearest available donor.</div>
        </Link>
      </div>
    </main>
  );
}
