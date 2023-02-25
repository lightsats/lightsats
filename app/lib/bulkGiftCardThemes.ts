import { BulkGiftCardTheme } from "types/BulkGiftCardTheme";

export const bulkGiftCardThemes: BulkGiftCardTheme[] = [
  {
    filename: "pepe-frog",
    userId: "cle8sc7cn01m1jtf7zvhsipns",
  },
  {
    filename: "lsd-girl-1",
    userId: "cle8sc7cn01m1jtf7zvhsipns",
  },
  {
    filename: "lsd-guy-1",
    userId: "cle8sc7cn01m1jtf7zvhsipns",
  },
  {
    filename: "lsd-girl-2",
    userId: "cle8sc7cn01m1jtf7zvhsipns",
  },
  {
    filename: "lsd-guy-2",
    userId: "cle8sc7cn01m1jtf7zvhsipns",
  },
  {
    filename: "lsd-unicorn-1",
    userId: "cle8sc7cn01m1jtf7zvhsipns",
  },
  {
    filename: "lsd-unicorn-2",
    userId: "cle8sc7cn01m1jtf7zvhsipns",
  },
  {
    filename: "lsd-bird",
    userId: "cle8sc7cn01m1jtf7zvhsipns",
  },
  {
    filename: "lsd-leopard",
    userId: "cle8sc7cn01m1jtf7zvhsipns",
  },
  {
    filename: "lsd-elephant",
    userId: "cle8sc7cn01m1jtf7zvhsipns",
  },
];

const overrideUserId = process.env.NEXT_PUBLIC_OVERRIDE_THEME_USERID;
if (overrideUserId) {
  bulkGiftCardThemes.forEach((theme) => {
    theme.userId = overrideUserId;
  });
}
