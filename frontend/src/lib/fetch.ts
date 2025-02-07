import { API_URL } from "@/common/constants/api";
import { getErrorMessage } from "./errors";
import { cookies } from "next/headers";
import { AUTHENTICATION_COOKIE } from "@/common/constants/auth-cookie";
import authenticated from "./authenticated";

const getHeaders = async () => {
    const cookieStore = await cookies(); // Resolve the Promise
    const isAuthenticated = await authenticated(); // Resolve the authenticated Promise

    return {
        ...(isAuthenticated && {
            Authorization: `Bearer ${cookieStore.get(AUTHENTICATION_COOKIE)?.value}`,
        }),
        Cookie: cookieStore.toString(),
    };
};

export const post = async <T>(path: string, data: any) => {
    // console.log("hitting ...", `${API_URL}/${path}`)
    const res = await fetch(`${API_URL}/${path}`, {
        method: "POST",
        headers: {"Content-Type": "application/json", ...(await getHeaders()) },
        body: JSON.stringify(data)
    })

    const parsedRes = await res.json();
    console.log("request response: ", parsedRes, "status code: ", res.status)
    if(res.status === 400){
        return {error: parsedRes, data: null,  status: res.status}
    }
    if(!res.ok){
        return {error: parsedRes, data: null, status: res.status}
    }
    return { error: "", data: parsedRes as T, status: res.status }

}
export const get = async <T> (path: string) => {
    const res = await fetch(`${API_URL}/${path}`, {
        headers: {
            ...(await getHeaders())
        }
    })

    const parsedRes = await res.json() as T
    if(res.status === 400){
        return {error: parsedRes}
    }
    if(!res.ok){
        return {error: parsedRes, data: null, status: res.status}
    }
   
    return {error: null, data: parsedRes as T, status: res.status};

}



export const patch = async (path: string, data: any) => {
    // console.log("hitting ...", `${API_URL}/${path}`)
    const res = await fetch(`${API_URL}/${path}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json", ...(await getHeaders()) },
        body: JSON.stringify(data)
    })

    const parsedRes = await res.json();
    console.log("request response: ", parsedRes, "status code: ", res.status)
    if(res.status === 400){
        return {error: parsedRes}
    }
    if(!res.ok){
        return {error: getErrorMessage(parsedRes)}
    }
    return { error: "" }

}