"use client"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {  useState, useTransition } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { LoginSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/common/form-error";
import { FormSuccess } from "@/components/common/form-success";
import { login } from "../login";
import { useSearchParams } from "next/navigation";
import CardWrapper from "@/components/common/card-wrapper";
import Link from "next/link";




export default function LoginForm() {

      const searchParams = useSearchParams();
      const callbackUrl = searchParams.get("callbackUrl");

      const [showTwoFactor, setShowTwoFactor] = useState(false);
      const [error, setError] = useState<string | undefined>("");
      const [success, setSuccess] = useState("");
      const [isPending, startTransition] = useTransition();

      const form = useForm<z.infer<typeof LoginSchema>>({
          resolver: zodResolver(LoginSchema),
          defaultValues: {
              email: "",
              password: "",
          },
      });


      // 2. Define a submit handler.
      async function onSubmit(values: z.infer<typeof LoginSchema>) {
        setError("");
        setSuccess("");
        console.log("posting form data: ", values)
        startTransition(() => {
          
          login(values).then((data) => {
            if(typeof data.error === "object"){
              console.log(data.error?.email[0])
              if(data.error?.email){
                form.setError("email", { type: 'custom', message: data.error?.email[0] })
              }
              
              if(data.error?.password){
                form.setError("password", { type: 'custom', message: data.error?.password[0] })
              }

             
              
            } else {
              setError(data.error);
            }
          }).catch(() => setError(""));

        })
      }


   

    return (
      <>
          <CardWrapper title="Sign in to your account">
          
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {showTwoFactor && (
              <div className="mt-1">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="123456"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
            )}
                  {!showTwoFactor && (
              <>
                  <div className="mt-1">

                  <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input disabled={isPending}
                                  type="email" autoComplete="email" placeholder="johndoe@example.com" {...field} />
                            </FormControl>
                            
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                   
                  </div>
  
                  <div className="mt-1">
                    <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                  <Input disabled={isPending}  type="password" autoComplete="password" placeholder="Password" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                    
                    </div>


                   
  
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>
  
                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                </>)}

                <FormError message={error} />

                <FormSuccess message={success} />

                <div>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full text-white dark:text-gray-900 bg-sky-500 dark:bg-white"
                  >
                   {showTwoFactor ? "Confirm" : "Login"}
                  </Button>
                </div>
              </form>
              </Form>
  
              
           
          </CardWrapper>
          {/* <SignIn /> */}
      </>
    )
  }
  