import { config } from "@/app.config";
import { Tool } from "@/app.types";

interface ExtractParams {
  tool: Tool;
  processOutput?: boolean;
  pdf: File;
  options: ExtractionOptions;
}

interface ExtractionOptions {
  tables: boolean;
  text: boolean;
}

export const extractionService = {
  query: {
    async extract({ tool, processOutput, pdf, options }: ExtractParams) {
      const formData = new FormData();
      formData.append("pdf", pdf);
      formData.append("tables", options.tables ? "true" : "false");
      formData.append("text", options.text ? "true" : "false");

      const response = await fetch(
        config.ENDPOINTS.extraction({
          tool,
          processOutput: processOutput ?? true,
        }),
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to extract data");
      }

      return response.json();
    },
  },
};
