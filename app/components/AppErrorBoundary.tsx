import { Button, Text } from "@nextui-org/react";
import { FlexBox } from "components/FlexBox";
import React, { ErrorInfo } from "react";
import toast from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/ban-types
type AppErrorBoundaryProps = {};
type AppErrorBoundaryState = { hasError: boolean };

export class AppErrorBoundary extends React.Component<
  React.PropsWithChildren<AppErrorBoundaryProps>,
  AppErrorBoundaryState
> {
  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    if ((event?.reason?.message as string)?.indexOf("Prompt was closed") > -1) {
      toast.error("Wallet Prompt was closed");
    } else {
      console.error(
        "AppErrorBoundary.promiseRejectionHandler",
        event?.reason ?? "Unknown"
      );
      event.preventDefault();
    }
  };

  constructor(props: AppErrorBoundaryProps) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("AppErrorBoundary.getDerivedStateFromError", error);
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }
  componentDidMount() {
    // Add an event listener to the window to catch unhandled promise rejections & stash the error in the state
    window.addEventListener("unhandledrejection", this.promiseRejectionHandler);
  }

  componentWillUnmount() {
    window.removeEventListener(
      "unhandledrejection",
      this.promiseRejectionHandler
    );
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can use your own error logging service here
    console.error("AppErrorBoundary.componentDidCatch", error);
    console.log({ error, errorInfo });
  }
  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <FlexBox
          style={{
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Text h4>Oops, something went wrong</Text>
          <Button auto onClick={() => window.location.reload()}>
            Try again
          </Button>
        </FlexBox>
      );
    }
    // Return children components in case of no error
    return this.props.children;
  }
}

export default AppErrorBoundary;
