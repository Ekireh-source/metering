"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import type { z } from "zod";
import { Terminal } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/anim/input";
import CardWrapper from "@/components/common/card-wrapper";
import { FormError } from "@/components/common/form-error";
import { FormSuccess } from "@/components/common/form-success";
import { Button } from "@/components/ui/button";
import { Input as ShadIput } from "@/components/ui/input";
import { BuyUnitSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { buyUnits } from "../buy-units";
import {formatCurrency} from "@/lib/utils"
// import { Badge } from "@/components/ui/badge"
import { useAccount } from "@/hooks/use-account";

export default function WithdrawForm() {
      const formatter = formatCurrency("USD")
      const searchParams = useSearchParams();
      const [error, setError] = useState<string | undefined>("");
      const [success, setSuccess] = useState("");
      const [token, setToken] = useState("")
      const [isPending, startTransition] = useTransition();

      const {user, loading} = useAccount()

      const form = useForm<z.infer<typeof BuyUnitSchema>>({
          resolver: zodResolver(BuyUnitSchema),
          defaultValues: {
              amount: 0,
              phone_number: ""
          },
      });


      // 2. Define a submit handler.
      async function onSubmit(values: z.infer<typeof BuyUnitSchema>) {
        setError("");
        setSuccess("");
        console.log("posting form data: ", values)
        startTransition(async () => {

        

            buyUnits(values).then((data) => {
            console.log("Responded with: ", data?.data?.token);
            if (data?.error) {
              // form.reset();
              
              if(typeof data.error === "object"){
                if(data.error?.amount){
                  form.setError("amount", { type: 'custom', message: data.error?.amount[0] })
                }
                if(data.error?.phone_number){
                  form.setError("phone_number", { type: 'custom', message: data.error?.phone_number[0] })
                }
                
              } else {
                setError(data.error);
              }
            }
  
            if (data?.data?.token) {
              form.reset();
              setToken(data?.data?.token);
              // setSuccess(data?data?.message)
            }
  
          }).catch(() => setError(""));

        })
      }

     
    if (loading){
      return null
    }

    return (
      <>
          <CardWrapper title="Buy Token">

          {/* <div className="flex justify-center items-center mb-5">
            <Badge className="text-xl font-light" variant="outline">Account balance {formatter.format(Number(user?.wallet.balance))}</Badge>
          </div> */}
            {!!token && <div>
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Token</AlertTitle>
                  <AlertDescription>
                    {token}
                  </AlertDescription>
                </Alert>

                </div>}
          
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  <div className="mt-1">

                  <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Amount (UGX)</FormLabel>
                            <FormControl>
                                <Input disabled={isPending}
                                  type="number"  placeholder="5000" {...field} />
                            </FormControl>
                            
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                   
                  </div>

                  <div className="flex flex-col space-y-1.5">

                    <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                        <FormItem >
                        <FormLabel className="font-semibold">Phone number</FormLabel>
                        <FormControl>
                        <PhoneInput
                            // className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground  disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                            
                            inputComponent={ShadIput}
                            // inputComponent={React.forwardRef((ref) => <Input  type="tel" placeholder="Enter phone number"  {...field} />)}
                        />
                        </FormControl>

                        
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    </div>
  
                <div>

                </div>


                <FormError message={error} />

                <FormSuccess message={success} />

                <div>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full text-white bg-sky-500 dark:text-gray-900"
                  >
                   Purchase
                  </Button>
                </div>
              </form>
              </Form>
  
              
           
          </CardWrapper>
          {/* <SignIn /> */}
      </>
    )
  }

  const LabelInputContainer = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <div className={cn("flex flex-col space-y-2 w-full", className)}>
        {children}
      </div>
    );
  };
  