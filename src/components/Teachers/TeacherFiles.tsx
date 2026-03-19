// src/components/Teachers/TeacherFiles.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../../hooks/axiosPublic";
import {
  type Teacher,
  TeacherCard,
  SkeletonCard,
  EmptyState,
  TeacherFilesPageShell,
} from "./TeacherFiles.Ui";

const TeacherFiles = () => {
  const [search, setSearch] = useState("");

  const { data: teachers = [], isLoading } = useQuery<Teacher[]>({
    queryKey: ["teacherFiles"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/api/users");
      const list = Array.isArray(data) ? data : [];
      return list.filter(
        (u: Teacher) =>
          (u.role === "teacher" ||
            u.role === "admin" ||
            u.role === "principal") &&
          !u.isHardcoded,
      );
    },
  });

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      !q ||
      t.name?.toLowerCase().includes(q) ||
      t.phone?.includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.qualification?.toLowerCase().includes(q) ||
      t.district?.toLowerCase().includes(q) ||
      t.thana?.toLowerCase().includes(q)
    );
  });

  return (
    <TeacherFilesPageShell
      totalCount={teachers.length}
      search={search}
      onSearch={setSearch}
    >
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t, i) => (
            <TeacherCard key={t._id} teacher={t} index={i} />
          ))}
        </div>
      )}
    </TeacherFilesPageShell>
  );
};

export default TeacherFiles;
