import { User } from "@/interface/user.interface";
import { getUserConfig } from "@/lib/account";
import authenticated from "@/lib/authenticated";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "P2P ENERGY SHARING | Home",
  description: "Share with the world",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // check if the user is authenticated
  const headersList = headers();
  console.log(`headers List: ${(await headersList).get("x-current-path")}`)
  const pathname = (await headersList).get("x-current-path") || "";
  const isAuth = await authenticated()

  console.log(`Intermediate layout: latest :: ${pathname}`)
  if(isAuth){
    const userConfig = await getUserConfig<User>()
    console.log({userConfig})
    const email_verified = userConfig?.profile?.email_verified
    if(!email_verified && pathname !== "/ck/verify/email"){
      // static logout
      // cookies().delete(AUTHENTICATION_COOKIE)
      redirect("/ck/verify/email")
    }
  } 

  return (
        <>{children}</>     
  );
}
