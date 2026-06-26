import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "helvinav-sanity-studio",
  title: "HelviNav Content Studio",
  projectId: "kltpvgen",
  dataset: "production",
  plugins: [
    structureTool({
      title: "Articles",
      structure: (S) =>
        S.documentTypeList("article")
          .title("Articles")
          .defaultOrdering([
            { field: "language", direction: "asc" },
            { field: "category", direction: "asc" },
            { field: "published", direction: "desc" },
            { field: "title", direction: "asc" },
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
