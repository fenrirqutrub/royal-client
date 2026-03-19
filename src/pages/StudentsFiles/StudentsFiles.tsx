// StudentsFiles.tsx — শুধু logic, UI import করে ব্যবহার করে

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../../hooks/axiosPublic";
import {
  type Student,
  StudentCard,
  SkeletonCard,
  EmptyState,
  StudentsPageShell,
} from "./StudentsFiles.Ui";

const StudentsFiles = () => {
  const [search, setSearch] = useState("");

  // ── Data fetch ────────────────────────────────────────────────────────────
  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/api/users?role=student");
      const list = Array.isArray(data) ? data : [];
      return list.filter(
        (u: Student) => u.role === "student" && !u.isHardcoded,
      );
    },
  });

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.studentClass?.toLowerCase().includes(q) ||
      s.district?.toLowerCase().includes(q)
    );
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <StudentsPageShell
      totalCount={students.length}
      search={search}
      onSearch={setSearch}
    >
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s, i) => (
            <StudentCard key={s._id} student={s} index={i} />
          ))}
        </div>
      )}
    </StudentsPageShell>
  );
};

export default StudentsFiles;
