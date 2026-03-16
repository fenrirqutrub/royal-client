// src/pages/Admin/Management/ManageWeeklyExam.tsx
import { useAuth } from "../../../context/AuthContext";
import ExamManageShell from "./ManagementShell";
import type { ManagedRecord, ShellConfig } from "./ManagementShell";

const ManageWeeklyExam = () => {
  const { user } = useAuth();
  const canSeeAll =
    user?.role === "admin" ||
    user?.role === "principal" ||
    user?.role === "owner";

  const config: ShellConfig = {
    title: "সাপ্তাহিক পরীক্ষা পরিচালনা",
    apiPath: "/api/weekly-exams",
    queryKey: canSeeAll ? ["weekly-exams"] : ["weekly-exams", user?.slug ?? ""],
    groupLabel: "পরীক্ষা",
    groupField: "ExamNumber",
    hasImages: true,
    updateMethod: "put",

    mapRecord: (raw): ManagedRecord => ({
      _id: raw._id as string,
      subject: raw.subject as string,
      teacher: raw.teacher as string,
      teacherSlug: raw.teacherSlug as string | undefined,
      class: raw.class as string,
      groupKey: raw.ExamNumber as string,
      topics: raw.topics as string,
      images: raw.images as ManagedRecord["images"],
      createdAt: raw.createdAt as string,
    }),

    buildFormData: (data, original, existingImages, newFiles) => {
      const fd = new FormData();
      fd.append("subject", data.subject);
      fd.append("class", data.class);
      fd.append("ExamNumber", data.groupKey);
      fd.append("topics", data.topics);
      fd.append("teacher", original.teacher);
      if (original.teacherSlug) fd.append("teacherSlug", original.teacherSlug);
      existingImages.forEach((img) =>
        fd.append("existingImages", img.imageUrl),
      );
      newFiles.forEach((f) => fd.append("images", f));
      return fd;
    },
  };

  return <ExamManageShell config={config} />;
};

export default ManageWeeklyExam;
