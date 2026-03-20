// src/pages/Admin/Management/ManageDailyLesson.tsx

import { useAuth } from "../../../context/AuthContext";
import ManagementShell from "./ManagementShell";
import type { ManagedRecord, ShellConfig } from "./ManagementShell";

const ManageDailyLesson = () => {
  const { user } = useAuth();
  const canSeeAll =
    user?.role === "admin" ||
    user?.role === "principal" ||
    user?.role === "owner";

  const config: ShellConfig = {
    title: "দৈনিক পাঠ পরিচালনা",
    apiPath: "/api/daily-lesson",
    queryKey: canSeeAll
      ? ["daily-lessons"]
      : ["daily-lessons", user?.slug ?? ""],
    groupLabel: "অধ্যায়",
    groupField: "chapterNumber",
    hasImages: false,
    updateMethod: "patch",
    useDateFilter: true,

    mapRecord: (raw): ManagedRecord => ({
      _id: raw._id as string,
      subject: raw.subject as string,
      teacher: raw.teacher as string,
      teacherSlug: raw.teacherSlug as string | undefined,
      class: raw.class as string,
      groupKey: raw.chapterNumber as string,
      topics: raw.topics as string,
      images: undefined,
      createdAt: raw.createdAt as string,
    }),

    buildFormData: (data, original) => {
      const fd = new FormData();
      fd.append("subject", data.subject);
      fd.append("class", data.class);
      fd.append("chapterNumber", data.groupKey);
      fd.append("topics", data.topics);
      fd.append("teacher", original.teacher);
      if (original.teacherSlug) fd.append("teacherSlug", original.teacherSlug);
      return fd;
    },
  };

  return <ManagementShell config={config} />;
};

export default ManageDailyLesson;
