import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Transaction } from "@/interface/token.interface"
import { User } from "@/interface/user.interface"
import { getUserConfig } from "@/lib/account"
import { get } from "@/lib/fetch"
import { cn, formatCurrency } from "@/lib/utils"
import {
  ArrowUpRight,
  CheckCheck,
  Clock10Icon,
  EllipsisVertical,
  PlusCircle,
  XIcon
} from "lucide-react"
import Link from "next/link"
import DesktopSidebar from "./_components/desktop-sidebar"
import RightHeader from "./_components/right-header"
import TransactionButton from "./_components/txn-button"
import LinkText from "@/components/common/link-text"

export default async function Dashboard() {
  const userConfig = await getUserConfig<User>()

  console.log("user: "+userConfig);

  const app_host = process.env.APP_URL as string

  const formatter = formatCurrency(userConfig?.wallet?.currency! ?? "USD")
//   let transactions: Transaction[] | null = null
//   try{
//     const response = await get<any>(`transactions/transactions/?page=1`)
//     transactions = response.data?.results
//   }catch(e){
//     return <p>Error loading dashboard</p>
//   }


  if(!userConfig){
    return <div className="w-full flex justify-center items-center">
        <div>
          <p>Please refresh the browser</p>
        </div>
    </div>
  }


  return (<div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {!!userConfig && <DesktopSidebar />}
      <div className="flex flex-col">
        <RightHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Back office</h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Card
                className="sm:col-span-2"
              >
                {/* <CardHeader className="pb-3">
                  <CardTitle>Package</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                   Display something
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col items-start gap-2">
                  <div>
                  Display something
                  </div>
                  <h2>Referral Link: </h2>
                  
                </CardFooter> */}
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Actions</CardDescription>
                  {/* <CardTitle className="text-4xl">{formatter.format(Number(userConfig?.wallet.balance))}</CardTitle> */}
                </CardHeader>

                {/* <CardFooter className="flex justify-between">
                  <Link className="inline-flex gap-1" href="/dashboard/deposit"><PlusCircle className="w-4 h-auto" /><span>Create certificate</span></Link>
                  <Link className="inline-flex gap-1" href="/dashboard/withdraw"><span>Verify certificate</span> <ArrowUpRight className="w-4 h-auto" /></Link>
                </CardFooter> */}
                
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  {/* <CardDescription>Total earnings</CardDescription> */}
                  {/* <CardTitle className="text-4xl">{formatter.format(Number(userConfig?.wallet.total_earnings))}</CardTitle> */}
                </CardHeader>
                
              </Card>
            </div>

          <div
            className="flex flex-1 justify-center rounded-lg border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
          >

            <div className="flex flex-col gap-1 w-full">
              <h3 className="text-2xl text-left font-bold tracking-tight p-4">
                Latest transactions
              </h3>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
