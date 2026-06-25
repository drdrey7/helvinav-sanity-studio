import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "helvinav-sanity-studio",
  title: "HelviNav Content Studio",
  projectId: "kltpvgen",
  dataset: "production",
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
});
