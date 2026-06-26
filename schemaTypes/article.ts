import { defineField, defineType } from "sanity";
import { authorDefaults, categoryOptions, languageOptions, reservedGuideSlugs } from "./articleConstants";

const slugFromValue = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
};

const getOptionLabel = <T extends { title: string; value: string }>(options: readonly T[], value: string | undefined) =>
  options.find((option) => option.value === value)?.title ?? value ?? "";

const getDocumentIdPair = (documentId: string | undefined) => {
  if (!documentId) {
    return { draftId: undefined, publishedId: undefined };
  }

  const publishedId = documentId.replace(/^drafts\./, "");
  return {
    draftId: `drafts.${publishedId}`,
    publishedId,
  };
};

const seoTitleValidation = (Rule: any) =>
  Rule.custom((value: unknown) => {
    if (typeof value !== "string" || !value.trim()) {
      return true;
    }

    const length = value.trim().length;
    if (length < 25) {
      return "SEO title looks very short";
    }

    if (length > 65) {
      return "SEO title should stay around 65 characters or fewer";
    }

    return true;
  }).warning();

const seoDescriptionValidation = (Rule: any) =>
  Rule.custom((value: unknown) => {
    if (typeof value !== "string" || !value.trim()) {
      return true;
    }

    const length = value.trim().length;
    if (length < 50) {
      return "SEO description looks very short";
    }

    if (length > 160) {
      return "SEO description should stay around 160 characters or fewer";
    }

    return true;
  }).warning();

const requiredAltTextValidation = (Rule: any) =>
  Rule.custom((alt: unknown, context: { parent?: { asset?: unknown } }) => {
    const hasAsset = Boolean(context.parent && typeof context.parent === "object" && "asset" in context.parent && context.parent.asset);
    if (!hasAsset) {
      return true;
    }

    return typeof alt === "string" && alt.trim() ? true : "Alt text is required";
  });

const articleSlugValidation = (Rule: any) =>
  Rule.required()
    .custom((slug: { current?: string } | undefined, context: { document?: { _id?: string; language?: string }; getClient?: (options: { apiVersion: string }) => { fetch: (query: string, params?: Record<string, unknown>) => Promise<number> } }) => {
      const slugValue = slugFromValue(slug?.current);
      if (!slugValue) {
        return true;
      }

      if (reservedGuideSlugs.includes(slugValue as (typeof reservedGuideSlugs)[number])) {
        return "This slug is reserved for an existing HelviNav route";
      }

      const documentId = context.document?._id;
      const language = context.document?.language;

      if (!documentId || !language || !context.getClient) {
        return true;
      }

      const { draftId, publishedId } = getDocumentIdPair(documentId);
      const client = context.getClient({ apiVersion: "2024-06-01" });

      return client
        .fetch<number>(
          'count(*[_type == "article" && language == $language && slug.current == $slug && !(_id in [$draftId, $publishedId])])',
          { language, slug: slugValue, draftId, publishedId },
        )
        .then((count) => (count > 0 ? "This slug must be unique within the selected language" : true))
        .catch(() => true);
    });

const bodyBlocks = {
  title: "Text block",
  type: "block",
  styles: [
    { title: "Normal", value: "normal" },
    { title: "Heading 2", value: "h2" },
    { title: "Heading 3", value: "h3" },
  ],
  lists: [
    { title: "Bullet", value: "bullet" },
    { title: "Numbered", value: "number" },
  ],
  marks: {
    decorators: [
      { title: "Strong", value: "strong" },
      { title: "Emphasis", value: "em" },
    ],
    annotations: [
      {
        name: "link",
        title: "Link",
        type: "object",
        fields: [
          defineField({
            name: "href",
            title: "URL",
            type: "string",
            validation: (Rule) =>
              Rule.required().custom((value: unknown) => {
                if (typeof value !== "string" || !value.trim()) {
                  return true;
                }

                const url = value.trim();
                const forbiddenSchemes = ["javascript:", "data:", "vbscript:"];
                const hasForbiddenScheme = forbiddenSchemes.some((scheme) =>
                  url.toLowerCase().startsWith(scheme),
                );

                if (hasForbiddenScheme) {
                  return "This URL scheme is not allowed";
                }

                if (url.startsWith("//")) {
                  return "Protocol-relative URLs are not allowed; use http:// or https:// for external links, or a root-relative path for internal links";
                }

                if (url.startsWith("/")) {
                  return true;
                }

                try {
                  const parsed = new URL(url);
                  if (parsed.protocol === "http:" || parsed.protocol === "https:") {
                    return true;
                  }
                } catch {
                  return "Invalid URL. Use an absolute http:// or https:// URL, or a root-relative path starting with /";
                }

                return "Invalid URL. Use an absolute http:// or https:// URL, or a root-relative path starting with /";
              }),
          }),
          defineField({
            name: "blank",
            title: "Open in new tab",
            type: "boolean",
            initialValue: false,
          }),
        ],
      },
    ],
  },
};

const bodyImage = {
  name: "image",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      validation: requiredAltTextValidation,
    }),
  ],
};

export const article = defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: articleSlugValidation,
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      options: { list: languageOptions },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: categoryOptions },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: requiredAltTextValidation,
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value: unknown, context: { document?: { published?: boolean } }) => {
          if (
            context.document?.published &&
            (!value ||
              typeof value !== "object" ||
              !("asset" in (value as object)) ||
              !(value as { asset?: unknown }).asset)
          ) {
            return "Cover image is required when the article is published";
          }

          return true;
        }),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [bodyBlocks, bodyImage],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (Rule) =>
        Rule.custom((value: unknown, context: { document?: { published?: boolean } }) => {
          if (context.document?.published && !value) {
            return "Published at is required when the article is published";
          }

          return true;
        }),
    }),
    defineField({
      name: "authorName",
      title: "Author name",
      type: "string",
      initialValue: authorDefaults.authorName,
    }),
    defineField({
      name: "authorDisplayName",
      title: "Author display name",
      type: "string",
      initialValue: authorDefaults.authorDisplayName,
    }),
    defineField({
      name: "authorSlug",
      title: "Author slug",
      type: "slug",
      options: { source: "authorDisplayName", maxLength: 96 },
      initialValue: { current: authorDefaults.authorSlug },
    }),
    defineField({
      name: "readingTimeMinutes",
      title: "Reading time (minutes)",
      type: "number",
      validation: (Rule) => Rule.integer().min(1),
    }),

    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      validation: seoTitleValidation,
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
      validation: seoDescriptionValidation,
    }),
  ],
  preview: {
    select: {
      title: "title",
      language: "language",
      category: "category",
      published: "published",
      authorDisplayName: "authorDisplayName",
      coverImage: "coverImage",
    },
    prepare(selection: {
      title?: string;
      language?: string;
      category?: string;
      published?: boolean;
      authorDisplayName?: string;
      coverImage?: { asset?: unknown; alt?: string };
    }) {
      const status = selection.published ? "Published" : "Draft";
      const language = getOptionLabel(languageOptions, selection.language);
      const category = getOptionLabel(categoryOptions, selection.category);
      const author = selection.authorDisplayName || authorDefaults.authorDisplayName;

      return {
        title: selection.title || "Untitled article",
        subtitle: [language, category, status, author].filter(Boolean).join(" • "),
        media: selection.coverImage,
      };
    },
  },
});
