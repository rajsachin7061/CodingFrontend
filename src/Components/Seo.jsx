
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.codesniper.in";

export default function SEO({
  title,
  description,
  path = "/",
  noindex = false,
  image = `${SITE_URL}/og-image.png`,
}) {
  const pageTitle = title
    ? `${title} | CodeSniper`
    : "CodeSniper - Coding Practice & DSA";

  const canonicalUrl = new URL(path, SITE_URL).href;

  return (
    <Helmet>
      <title>{pageTitle}</title>

      <meta
        name="description"
        content={description}
      />

      <meta
        name="robots"
        content={
          noindex
            ? "noindex,follow"
            : "index,follow"
        }
      />

      <link
        rel="canonical"
        href={canonicalUrl}
      />

      <meta
        property="og:type"
        content="website"
      />

      <meta
        property="og:title"
        content={pageTitle}
      />

      <meta
        property="og:description"
        content={description}
      />

      <meta
        property="og:url"
        content={canonicalUrl}
      />

      <meta
        property="og:image"
        content={image}
      />

      <meta
        name="twitter:card"
        content="summary_large_image"
      />
    </Helmet>
  );
}
