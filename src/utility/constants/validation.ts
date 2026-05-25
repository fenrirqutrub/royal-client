// src/utility/constants/validation.ts

import { toEn } from "../Formatters";

export const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export const toAsciiDigits = (val: string): string => toEn(val);

export const validateBdPhone = (val: string): true | string => {
  const ascii = toAsciiDigits(val);

  return (
    BD_PHONE_REGEX.test(ascii) ||
    "সঠিক বাংলাদেশি নম্বর দিন (০১৩–০১৯ দিয়ে শুরু)"
  );
};
