"use server"


import { API_URL } from "@/common/constants/api";
import { getErrorMessage } from "@/lib/errors";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginSchema } from "@/lib/schema";
import { z } from "zod";
import { AUTHENTICATION_COOKIE, AUTHENTICATION_REFRESH_COOKIE } from "@/common/constants/auth-cookie";

export const login = async (data: z.infer<typeof LoginSchema>) => {

    const res = await fetch(`${API_URL}/auth/login/`, {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify(data)
    })

    // const textResponse = await res.text()
    // console.log("Text response: ", textResponse)
    const parsedRes = await res.json();
    console.log("debug: ", parsedRes)
    if(res.status === 400){
        return {error: parsedRes}
    }
    if(!res.ok){
        return {error: getErrorMessage(parsedRes)}
    }
    setAuthCookie(parsedRes);
    redirect("/dashboard")

    return {error: ""}

}


const setAuthCookie = async ({refresh, access}: {refresh: string, access: string}) => {

    if (access) {
        const cookieStore = await cookies(); // Use 'await' to resolve the Promise
        cookieStore.set({
            name: AUTHENTICATION_COOKIE,
            value: access,
            secure: true,
            httpOnly: true,
            expires: new Date(jwtDecode(access).exp! * 1000),
        });
    }
    
    if (refresh) {
        const cookieStore = await cookies(); // Use 'await' to resolve the Promise
        cookieStore.set({
            name: AUTHENTICATION_REFRESH_COOKIE,
            value: refresh,
            secure: true,
            httpOnly: true,
            expires: new Date(jwtDecode(refresh).exp! * 1000),
        });
    }

}