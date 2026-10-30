import type { CheckoutRequest } from "@/features/store/checkout-schema";
import { formatMoney } from "@/lib/money";

export type PricedLine = {
  name: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
  box?: { size: number; flavors: string[]; bowColor: string };
};

export function makeWhatsappMessage(input: CheckoutRequest, lines: PricedLine[]) {
  const subtotal = lines.reduce((sum, line) => sum + line.subtotalCents, 0);
  const itemLines = lines.map((line) => `${line.quantity} × ${line.name} — ${formatMoney(line.subtotalCents)}`);
  const boxes = lines.filter((line) => line.box);
  const boxLines = boxes.length
    ? boxes.map((line) => `• ${line.quantity} caixinha com ${line.box!.size} brownies: ${line.box!.flavors.join(", ")}; laço ${line.box!.bowColor.toLowerCase()}.`)
    : ["Nenhuma caixinha personalizada."];

  return [
    "Olá! Gostaria de fazer um pedido.",
    "",
    `*Nome:* ${input.customerName}`,
    input.customerPhone ? `*Telefone:* ${input.customerPhone}` : "",
    `*Forma de pagamento:* ${input.paymentMethod}`,
    "",
    "*Pedido:*",
    ...itemLines,
    "",
    "*Caixinhas personalizadas:*",
    ...boxLines,
    "",
    `*Subtotal dos produtos:* ${formatMoney(subtotal)}`,
    `*Total:* ${formatMoney(subtotal)}`,
    "",
    "*Forma de recebimento:* Retirada",
    `*Observações:* ${input.notes || "Nenhuma"}`,
    "",
    "Aguardo a confirmação. Obrigado!",
  ].filter(Boolean).join("\n");
}
