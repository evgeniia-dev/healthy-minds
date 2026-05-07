type UserAvatarProps = {
  fullName?: string | null;
  email?: string | null;
};

// Creates avatar initials from the user's full name.
// If full name is missing, it falls back to the email address.
// If both are missing, it uses "User" as a safe fallback.
function getInitials(fullName?: string | null, email?: string | null) {
  const source = fullName?.trim() || email?.trim() || "User";

  const parts = source
    .replace(/@.*$/, "")
    .split(" ")
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function UserAvatar({ fullName, email }: UserAvatarProps) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
      {getInitials(fullName, email)}
    </div>
  );
}