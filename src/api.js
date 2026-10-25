import { sb } from './supabase'

const wrap = (error) => {
  if (!error) return;

  console.error("Supabase RPC error:", error);

  const message = error.message || "Unknown error";

  throw new Error(
    message.toLowerCase().includes("not allowed")
      ? "Ye account admin nahi hai"
      : message
  );
};

export async function rpc(fn, args, range) {
  try {
    let q = sb.rpc(fn, args);

    if (range) {
      q = q.range(range[0], range[1]);
    }

    const { data, error } = await q;

    wrap(error);

    return data;
  } catch (error) {
    console.error("RPC failed:", error);
    throw error;
  }
}

// 1000-1000 ke batches mein saare rows laata hai
export async function rpcAll(fn, args, onProgress) {
  let out = []
  for (let from = 0; ; from += 1000) {
    const data = await rpc(fn, args, [from, from + 999])
    out = out.concat(data)
    if (onProgress) onProgress(out.length)
    if (data.length < 1000) return out
  }
}
