"use client"

import { IconMenu } from "@/components/common/icon-menu";
import { Transaction } from "@/interface/transaction.interface";
import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function TransactionButton({txn}: {txn: Transaction}){
    const [trasactioIdCopied, setTrasactioIdCopied] = useState("");


    return <>
    <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    txn.transaction_id
                  );
                  toast.success("Transaction ID to clipboard!");
                  setTrasactioIdCopied(txn.transaction_id);
                  setTimeout(() => setTrasactioIdCopied(""), 2000);
                }}
                className="w-full rounded-md p-2 text-left text-sm font-medium bg-gray-50 text-gray-500 transition-all duration-75 hover:bg-gray-100"
              >

                <IconMenu
                  text={ txn.transaction_id}
                  icon={
                    trasactioIdCopied === txn.transaction_id ? (
                      <CopyCheckIcon className="h-4 w-4" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )
                  }
                />
              </button>
    </>

}