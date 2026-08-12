import './globals.css';

export const metadata = {
  title: 'DepGraph - Software Dependency Graph Analysis',
  description: 'Graph-based vulnerability and dependency tracking powered by CognoDB.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
