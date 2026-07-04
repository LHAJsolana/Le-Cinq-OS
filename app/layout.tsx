import "./globals.css";import {Toaster} from "sonner";import type {Metadata} from "next";
export const metadata:Metadata={title:"Le Cinq OS",description:"Gestion simple des commandes — Café Le Cinq 5"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body><Toaster richColors position="top-center"/>{children}</body></html>}
