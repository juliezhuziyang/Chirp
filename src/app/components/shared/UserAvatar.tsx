import { useTranslation } from "react-i18next";
import { cn } from "../ui/utils";
import { getPreset } from "../../../lib/avatars";
import type { UserAvatar as AvatarType } from "../../../lib/types";

interface UserAvatarProps {
  avatar: AvatarType;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-base",
  md: "w-10 h-10 text-lg",
  lg: "w-14 h-14 text-2xl",
  xl: "w-20 h-20 text-3xl",
};

export function UserAvatar({ avatar, size = "md", className }: UserAvatarProps) {
  const { t } = useTranslation();
  const preset = getPreset(avatar.presetId);
  const label = t(`avatars.${preset.id}`, { defaultValue: preset.label });

  if (avatar.type === "custom" && avatar.customUrl) {
    return (
      <img
        src={avatar.customUrl}
        alt=""
        className={cn("rounded-full object-cover border-2 border-white shadow-md", sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center border-2 border-white shadow-md bg-gradient-to-br",
        preset.gradient,
        sizes[size],
        className,
      )}
      title={label}
    >
      <span>{preset.emoji}</span>
    </div>
  );
}
