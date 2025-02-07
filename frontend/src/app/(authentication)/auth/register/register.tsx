"use server"


import { get, post } from "@/lib/fetch";
import { redirect } from "next/navigation";
import { createAccountSchema } from "@/lib/schema";
import { z } from "zod";

import { cookies } from "next/headers";
import { VERIFICATION_EMAIL } from "@/common/constants/auth-cookie";

export default async function createUser(data: z.infer<typeof createAccountSchema>){
  const { error } = await post("auth/register/", data);

  if(error){
    return { error }
  } 

  const exp = Date.now() + (24 * 60 * 60 * 100)
  const cookieStore = await cookies()
  cookieStore.set({
            name: VERIFICATION_EMAIL,
            value: data.email,
            secure: true,
            httpOnly: true,
            expires: exp,
  })

  redirect("/auth/login")

}


export async function getUserByRefCode<T>(refCode: string){
  const response = await get(`auth/get-user-sponsor/${refCode}`)
  return response.data as T
}
