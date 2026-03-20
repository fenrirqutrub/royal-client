// src/components/common/Avatar.tsx
//
// Usage:
//   // Teacher (color from role):
//   const { color } = ROLE_CONFIG[teacher.role ?? "teacher"];
//   <Avatar name={teacher.name} url={teacher.avatar?.url} color={color} size={52} radius="rounded-xl" />
//
//   // Student (color from gender):
//   const color = gender === "মেয়ে" ? "#ec4899" : "#3b82f6";
//   <Avatar name={student.name} url={student.avatar?.url} color={color} size={52} radius="rounded-xl" />

import { useState } from "react";

interface AvatarProps {
  name: string;
  url?: string | null;
  color: string;
  size?: number;
  radius?: string;
}

const Avatar = ({
  name,
  url,
  color,
  size = 64,
  radius = "rounded-2xl",
}: AvatarProps) => {
  const [err, setErr] = useState(false);

  return url && !err ? (
    <img
      src={url}
      alt={name}
      onError={() => setErr(true)}
      className={`${radius} object-cover shrink-0`}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className={`${radius} flex items-center justify-center text-white font-bold shrink-0`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}66, ${color})`,
        fontSize: size * 0.36,
      }}
    >
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
};

export default Avatar;
