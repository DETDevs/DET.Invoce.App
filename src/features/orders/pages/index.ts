import { type Product } from "@/features/orders/types";

export type CartItem = Product & { quantity: number };