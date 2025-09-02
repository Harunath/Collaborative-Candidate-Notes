// lib/toast.ts
import { toast } from "sonner";

export const toastOK = (
	msg: string,
	opts?: Parameters<typeof toast.success>[1]
) => toast.success(msg, opts);

export const toastErr = (
	msg: string,
	opts?: Parameters<typeof toast.error>[1]
) => toast.error(msg, opts);

export const toastInfo = (msg: string, opts?: Parameters<typeof toast>[1]) =>
	toast(msg, opts);
