import { Link } from "@/lib/navigation";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("nav");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">AI-native CMS</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Citation-worthy, entity-structured content with a Human-in-the-Loop editorial pipeline.
      </p>
      <Link
        href="/blog"
        className="inline-block px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium"
      >
        {t("blog")}
      </Link>
    </div>
  );
}
