import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  clientId: "efef55b3-3ff7-4fb3-90f5-df83d605cda6", // Your Client ID from TinaCMS dashboard
  token: process.env.TINA_TOKEN, // Will be set in Netlify environment variables
  
  build: {
    outputFolder: "admin",
    publicFolder: "/",
  },
  
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "/",
    },
  },
  
  schema: {
    collections: [
      {
        name: "products",
        label: "Products",
        path: ".",
        format: "json",
        ui: {
          filename: {
            readonly: true,
            slugify: () => "products",
          },
        },
        fields: [
          {
            type: "object",
            name: "products",
            label: "Products",
            list: true,
            ui: {
              itemProps: (item) => {
                return { label: item?.name || "New Product" };
              },
            },
            fields: [
              {
                type: "string",
                name: "id",
                label: "Product ID",
                required: true,
              },
              {
                type: "string",
                name: "name",
                label: "Product Name",
                required: true,
              },
              {
                type: "string",
                name: "description",
                label: "Description",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "number",
                name: "price",
                label: "Price ($)",
                required: true,
              },
              {
                type: "string",
                name: "category",
                label: "Category",
                options: [
                  { value: "clothing", label: "Clothing" },
                  { value: "accessories", label: "Accessories" },
                  { value: "collectibles", label: "Collectibles" },
                ],
                required: true,
              },
              {
                type: "image",
                name: "image",
                label: "Product Image",
              },
            ],
          },
        ],
      },
    ],
  },
}); 