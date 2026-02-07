import { type Product } from "../types";

export type CartItem = Product & { quantity: number };