import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { StatusBar } from "react-native";

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href={"/"} />;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
