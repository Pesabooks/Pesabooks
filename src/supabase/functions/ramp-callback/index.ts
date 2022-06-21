import { supabaseClient } from "../_shared/supabaseClient.ts";

//import { ethers } from "https://cdn.ethers.io/lib/ethers-5.4.6.esm.min.js";
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

// const onTransactionComplete = async (receipt: any, provider: any) => {
//   if (receipt.blockNumber) {
//     const timestamp = (await provider.getBlock(receipt.blockNumber)).timestamp;
//     const { error } = await supabaseClient
//       .from("transactions")
//       .update({ status: "completed", timestamp })
//       .eq("hash", receipt.transactionHash);
//     if (error) console.error(error);
//   }
// };

// const onTransactionFailed = async (txHash: string) => {
//   await supabaseClient.from("transactions").update({ status: "failed" }).eq("hash", txHash);
// };

serve(async (req) => {
  const { type, purchase } = await req.json();
  const { id: rampId, finalTxHash } = purchase;
  console.log(type, purchase);

  const { data: transactions } = await supabaseClient.from("transactions").select().eq("metadata->>ramp_id", rampId);
  const transaction = transactions?.[0];

  if (transaction) {
    if (type == "RELEASED") {
      await supabaseClient
        .from("transactions")
        .update({ hash: finalTxHash, status: "completed" })
        .eq("id", transaction.id);

      // const { data: pools } = await supabaseClient.from("pools").select().eq("id", transaction.pool_id);
      // const pool = pools?.[0];

      //const provider = new ethers.providers.InfuraProvider(pool.chain_id, Deno.env.get("INFURA_KEY"));

      // const tx = await provider.getTransaction(finalTxHash);
      // await tx.wait().then(
      //   async (receipt: any) => await onTransactionComplete(receipt, provider),
      //   async () => await onTransactionFailed
      // );
    } else if (type == "ERROR")
      await supabaseClient
        .from("transactions")
        .update({ status: "failed", hash: finalTxHash })
        .eq("id", transaction.id);
  }
  return new Response();
});
