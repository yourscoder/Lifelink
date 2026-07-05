import "./globals.css";

export const metadata = {
  title: "LifeLink Blood Bank",
  description: "Find blood donors nearby, fast.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
