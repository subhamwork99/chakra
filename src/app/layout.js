import { fonts } from "./font";
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fonts.rubik.variable}>
      <body>
        {" "}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
