"use client";

import { useMemo, useState } from "react";
import {
  Paper,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Progress,
  Box,
  List,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { IconCheck, IconArrowLeft } from "@/components/icons";

const STRENGTH_RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "Contains uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Contains lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "Contains a number", test: (v: string) => /\d/.test(v) },
  {
    label: "Contains special character (!@#$...)",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
];

function getStrength(password: string) {
  const passed = STRENGTH_RULES.filter((r) => r.test(password)).length;
  return { passed, total: STRENGTH_RULES.length, pct: (passed / STRENGTH_RULES.length) * 100 };
}

function getStrengthColor(pct: number) {
  if (pct <= 20) return "red";
  if (pct <= 40) return "orange";
  if (pct <= 60) return "yellow";
  if (pct <= 80) return "teal";
  return "green";
}

function getStrengthLabel(pct: number) {
  if (pct <= 20) return "Very weak";
  if (pct <= 40) return "Weak";
  if (pct <= 60) return "Fair";
  if (pct <= 80) return "Strong";
  return "Very strong";
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const form = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      currentPassword: (v) =>
        v.length >= 1 ? null : "Current password is required",
      newPassword: (v) =>
        getStrength(v).pct >= 60 ? null : "Password is too weak",
      confirmPassword: (v, values) =>
        v === values.newPassword ? null : "Passwords do not match",
    },
  });

  const strength = useMemo(
    () => getStrength(form.values.newPassword),
    [form.values.newPassword]
  );

  const handleSubmit = (_values: typeof form.values) => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      notifications.show({
        title: "Password changed",
        message: "Your password has been updated successfully.",
        color: "green",
      });
      router.push("/");
    }, 1000);
  };

  return (
    <Box className="flex min-h-screen items-center justify-center bg-background p-4">
      <Paper
        className="w-full max-w-[480px] border border-border bg-card p-8"
        radius="lg"
        shadow="lg"
      >
        <Button
          variant="subtle"
          size="xs"
          className="mb-6 text-muted-foreground"
          leftSection={<IconArrowLeft size={14} />}
          onClick={() => router.push("/")}
        >
          Back to tasks
        </Button>

        <Title order={2} className="mb-1 font-sans text-card-foreground">
          Change password
        </Title>
        <Text c="dimmed" size="sm" className="mb-8">
          Choose a strong password to keep your account secure.
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <PasswordInput
              label="Current password"
              placeholder="Enter current password"
              size="md"
              {...form.getInputProps("currentPassword")}
            />

            <PasswordInput
              label="New password"
              placeholder="Enter new password"
              size="md"
              {...form.getInputProps("newPassword")}
            />

            {/* Strength meter */}
            {form.values.newPassword.length > 0 && (
              <Stack gap="xs">
                <div className="flex items-center justify-between">
                  <Text size="xs" fw={500}>
                    Strength
                  </Text>
                  <Text
                    size="xs"
                    fw={600}
                    c={getStrengthColor(strength.pct)}
                  >
                    {getStrengthLabel(strength.pct)}
                  </Text>
                </div>
                <Progress
                  value={strength.pct}
                  color={getStrengthColor(strength.pct)}
                  size="sm"
                  radius="xl"
                  animated={strength.pct < 100}
                />
                <List size="xs" spacing={4} className="mt-1">
                  {STRENGTH_RULES.map((rule) => {
                    const passed = rule.test(form.values.newPassword);
                    return (
                      <List.Item
                        key={rule.label}
                        icon={
                          passed ? (
                            <span className="text-green-600">
                              <IconCheck size={14} />
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">
                              <IconCircleDot size={14} />
                            </span>
                          )
                        }
                        className={
                          passed
                            ? "text-card-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {rule.label}
                      </List.Item>
                    );
                  })}
                </List>
              </Stack>
            )}

            <PasswordInput
              label="Confirm new password"
              placeholder="Re-enter new password"
              size="md"
              {...form.getInputProps("confirmPassword")}
            />

            <Button
              type="submit"
              fullWidth
              size="md"
              color="indigo"
              loading={saving}
              className="mt-2"
            >
              Update password
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

function IconCircleDot({ size = 24 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}
