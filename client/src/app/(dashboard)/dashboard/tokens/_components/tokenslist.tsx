import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
  } from "@/components/ui/table";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
  } from "@/components/ui/dropdown-menu"
  import Link from "next/link"
  import {
    ArrowUpRight,
    CheckCheck,
    Clock10Icon,
    EllipsisVertical,
    PlusCircle,
    XIcon
  } from "lucide-react";
  import TransactionButton from "../../_components/txn-button";
import { get } from "@/lib/fetch";
import { Token } from "@/interface/token.interface";
import { cn } from "@/lib/utils";

const TokenList = async() => {
    let tokens: Token[] | null = null
    try{
        const response = await get<any>(`meter/token/`)
        tokens = response.data?.data
        console.log("tokens: ", tokens)

    }catch(e){
        return <p>Error loading dashboard</p>
    }
    return <div>
        <div className="flex flex-col gap-1 w-full">
              <h3 className="text-2xl text-left font-bold tracking-tight p-4">
                Latest Tokens
              </h3>

              <Table className="w-full">
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Token ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">&nbsp;</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tokens?.map((txn) => (
                    <TableRow key={txn.id}>
                        <TableCell className="font-medium">
                        {txn.id}
                        
                        </TableCell>
                        <TableCell>
                        <span className={cn(
                        "p-2 w-full flex justify-start items-center gap-1", 
                        {"text-gray-500": txn.is_used, "text-red-600": !txn.is_used}
                        )}>
                        {txn.is_used ? <CheckCheck className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
                        {txn.is_used ? "Used" : "Not Used"}
                        </span>


                        </TableCell>
                        <TableCell> <TransactionButton txn={txn} /></TableCell>
                        <TableCell className="text-right">{Number(txn.units).toFixed(2)}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger><EllipsisVertical /></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem asChild><Link href="">View</Link></DropdownMenuItem>
                            
                        </DropdownMenuContent>
                        </DropdownMenu>

                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
      
                </Table>

            </div>
    </div>
        
    
}

export default TokenList;