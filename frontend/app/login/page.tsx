"use client";

import { useState } from "react";
import {
  Paper,
  TextInput,
  PinInput,
  Button,
  Title,
  Text,
  Divider,
  Stack,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { IconBrandGoogle, IconMail, IconArrowLeft } from "@/components/icons";

type Step = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);

  const emailForm = useForm({
    initialValues: { email: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const handleSendCode = (values: typeof emailForm.values) => {
    setSending(true);
    // Simulate sending code
    setTimeout(() => {
      setEmail(values.email);
      setSending(false);
      setStep("code");
      notifications.show({
        title: "Code sent",
        message: `A 6-digit code has been sent to ${values.email}`,
        color: "indigo",
      });
    }, 1200);
  };

  const handleVerifyCode = () => {
    if (code.length < 6) {
      notifications.show({
        title: "Invalid code",
        message: "Please enter the full 6-digit code.",
        color: "red",
      });
      return;
    }
    notifications.show({
      title: "Welcome back!",
      message: `Signed in as ${email}`,
      color: "indigo",
    });
    router.push("/");
  };

  return (
    <Box className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-[960px] overflow-hidden rounded-xl shadow-xl">
        {/* Left decorative panel */}
        <div className="hidden flex-1 flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
          <div>
            <Title order={3} className="font-sans text-primary-foreground">
              TaskFlow
            </Title>
          </div>
          <div>
            <Title order={2} className="mb-4 font-sans leading-tight text-primary-foreground">
              Organize your life, one task at a time.
            </Title>
            <Text size="md" className="text-primary-foreground/80">
              Join thousands of productive people who trust TaskFlow to manage
              their daily tasks, projects, and goals.
            </Text>
          </div>
          <Text size="sm" className="text-primary-foreground/60">
            TaskFlow 2026
          </Text>
        </div>

        {/* Right form panel */}
        <Paper
          className="flex w-full flex-col justify-center bg-card p-8 md:w-[440px] md:p-12"
          radius={0}
        >
          {step === "email" ? (
            <>
              <Title order={2} className="mb-1 font-sans text-card-foreground" ta="center">
                Sign in
              </Title>
              <Text c="dimmed" size="sm" ta="center" className="mb-8">
                {"We'll send a verification code to your email"}
              </Text>

              <Button
                variant="default"
                fullWidth
                leftSection={<IconBrandGoogle size={18} />}
                className="mb-4 border-border bg-secondary text-secondary-foreground hover:bg-accent"
              >
                Continue with Google
              </Button>

              <Divider
                label="Or continue with email"
                labelPosition="center"
                className="mb-6"
              />

              <form onSubmit={emailForm.onSubmit(handleSendCode)}>
                <Stack gap="md">
                  <TextInput
                    label="Email address"
                    placeholder="you@example.com"
                    size="md"
                    leftSection={<IconMail size={16} />}
                    {...emailForm.getInputProps("email")}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    size="md"
                    color="indigo"
                    loading={sending}
                  >
                    Send code
                  </Button>
                </Stack>
              </form>
            </>
          ) : (
            <>
              <Button
                variant="subtle"
                size="xs"
                className="mb-4 self-start text-muted-foreground"
                leftSection={<IconArrowLeft size={14} />}
                onClick={() => {
                  setStep("email");
                  setCode("");
                }}
              >
                Back
              </Button>

              <Title order={2} className="mb-1 font-sans text-card-foreground" ta="center">
                Enter code
              </Title>
              <Text c="dimmed" size="sm" ta="center" className="mb-8">
                {"We sent a 6-digit code to "}
                <Text span fw={600} c="indigo" inherit>
                  {email}
                </Text>
              </Text>

              <Stack gap="lg" align="center">
                <PinInput
                  length={6}
                  size="lg"
                  type="number"
                  placeholder=""
                  value={code}
                  onChange={setCode}
                  oneTimeCode
                  autoFocus
                />

                <Button
                  fullWidth
                  size="md"
                  color="indigo"
                  onClick={handleVerifyCode}
                  disabled={code.length < 6}
                >
                  Verify & sign in
                </Button>

                <Text size="sm" c="dimmed" ta="center">
                  {"Didn't receive a code? "}
                  <Text
                    span
                    className="cursor-pointer text-primary"
                    fw={500}
                    onClick={() => handleSendCode({ email })}
                  >
                    Resend
                  </Text>
                </Text>
              </Stack>
            </>
          )}
        </Paper>
      </div>
    </Box>
  );
}
