"use client";

import SearchModal from "@/components/SearchModal";
import TwSizeIndicator from "@/helpers/TwSizeIndicator";
import { useTranslate } from "@/hooks/useTranslate";
import Footer from "@/partials/Footer";
import Header from "@/partials/Header";
import Providers from "@/partials/Providers";
import Link from "next/link";

export default function NotFound() {
  const {
    page_not_found,
    page_not_found_content,
    back_to_home,
    lang,
    main,
    footer,
  } = useTranslate();

  return (
    <>
   Not Found
    </>
  );
}
