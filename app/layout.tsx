import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'FlipRadar — знаходь потенційно вигідні угоди',
  description: 'Калькулятор перепродажу, список угод та пошукові посилання для реселерів в Україні.'
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uk"><body>{children}</body></html>;
}
