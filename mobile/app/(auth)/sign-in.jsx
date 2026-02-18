import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { styles } from "@/assets/styles/auth.styles.js";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showEmailCode, setShowEmailCode] = useState(false);
  const [error, setError] = useState("");

  const onSignInPress = useCallback(async () => {
    if (!isLoaded)
      try {
        const signInAttempt = await signIn.create({
          identifier: emailAddress,
          password,
        });

        if (signInAttempt.status === "complete") {
          await setActive({
            session: signInAttempt.createdSessionId,
            navigate: async ({ session }) => {
              if (session?.currentTask) {
                console.log(session?.currentTask);
                return;
              }

              router.replace("/");
            },
          });
        } else if (signInAttempt.status === "needs_second_factor") {
          const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
            (factor) => factor.strategy === "email_code",
          );

          if (emailCodeFactor) {
            await signIn.prepareSecondFactor({
              strategy: "email_code",
              emailAddressId: emailCodeFactor.emailAddressId,
            });
            setShowEmailCode(true);
          }
        } else {
          console.error(JSON.stringify(signInAttempt, null, 2));
        }
      } catch (err) {
        if (err.errors?.[0]?.code === "form_password_incorrect") {
          setError("Password is incorrect. Please try again.");
        } else {
          setError("An error occurred. Please try again.");
        }
      }
  }, [isLoaded, signIn, setActive, router, emailAddress, password]);

  const onVerifyPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            router.replace("/");
          },
        });
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [isLoaded, signIn, setActive, router, code]);
  if (showEmailCode) {
    return (
      <View style={styles.container}>
        <Text type="title" style={styles.title}>
          Verify your email
        </Text>
        <Text style={styles.description}>
          A verification code has been sent to your email.
        </Text>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter verification code"
          placeholderTextColor="#666666"
          onChangeText={(code) => setCode(code)}
          keyboardType="numeric"
        />
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onVerifyPress}
        >
          <Text style={styles.buttonText}>Verify</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={100}
    >
      <View>
        <View style={styles.container}>
          <Image
            source={require("../../assets/images/revenue-i4.png")}
            style={styles.illustration}
          />
          <Text type="title" style={styles.title}>
            Welcome Back
          </Text>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity on Prress={() => setError("")}>
                <Ionicons name="close" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={[styles.input, error && styles.errorInput]}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter email"
            placeholderTextColor="#9a8478"
            onChangeText={(email) => setEmailAddress(email)}
            keyboardType="email-address"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, error && styles.errorInput]}
            value={password}
            placeholder="Enter password"
            placeholderTextColor="#9A8478"
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />

          {/* <Pressable
            style={({ pressed }) => [
              styles.button,
              (!emailAddress || !password) && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={onSignInPress}
            disabled={!emailAddress || !password}
          >
            <Text style={styles.buttonText}>Sign in</Text>
          </Pressable> */}

          <TouchableOpacity style={styles.button} onPress={onSignInPress}>
            <Text style={styles.buttonText}>Sign in</Text>
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don&apos;t have an account?</Text>
            <Link href="/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
