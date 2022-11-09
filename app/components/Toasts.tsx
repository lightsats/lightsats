import { Card, Grid, Text } from "@nextui-org/react";
import { Colors } from "@nextui-org/react/types/theme";
import { FlexBox } from "components/FlexBox";
import create from "zustand";

let NEXT_TOAST_ID = 0;

export type Toast = {
  text: string;
  color?: keyof Colors;
};

type ToastInternal = Toast & { id: number };

type ToastsStore = {
  readonly toasts: ToastInternal[];
  addToast(toast: Toast): void;
};

export const useToastsStore = create<ToastsStore>((set, get) => ({
  toasts: [],
  addToast: (toast: Toast) =>
    set((state) => {
      const toastWithId: ToastInternal = {
        ...toast,
        id: NEXT_TOAST_ID++,
      };
      setTimeout(() => {
        set({
          ...get(),
          toasts: get().toasts.filter((t) => t !== toastWithId),
        });
      }, 3000);
      return { toasts: [...state.toasts, toastWithId] };
    }),
}));

export function Toasts() {
  const toasts = useToastsStore((store) => store.toasts);
  return (
    <FlexBox
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 10000,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Grid.Container gap={1} css={{ maxWidth: "400px" }}>
        {toasts.map((toast) => (
          <Grid key={toast.id} xs={12}>
            <Card
              css={{
                backgroundColor: "$success",
                width: "100%",
                animationName: "toast",
                animationDuration: "3s",
              }}
            >
              <Card.Body>
                <Text color="white" b>
                  {toast.text}
                </Text>
              </Card.Body>
            </Card>
          </Grid>
        ))}
      </Grid.Container>
    </FlexBox>
  );
}

export function notifySuccess(text: string) {
  addToast({ text, color: "success" });
}
export function notifyError(text: string) {
  addToast({ text, color: "error" });
}

export function addToast(toast: Toast) {
  useToastsStore.getState().addToast(toast);
}
