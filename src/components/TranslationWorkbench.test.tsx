import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TranslationWorkbench } from "@/components/TranslationWorkbench";
import { samplePatients } from "@/lib/patients";
import type { TranslationResult } from "@/lib/types";

const providerPayload = {
  providers: [
    {
      provider: "google",
      label: "Google Cloud",
      configured: true,
      missingConfig: [],
      detail: "Cloud Translation Advanced com ADC"
    },
    {
      provider: "openai",
      label: "OpenAI LLM",
      configured: true,
      missingConfig: [],
      detail: "Responses API com schema clínico"
    },
    {
      provider: "libretranslate",
      label: "LibreTranslate",
      configured: true,
      missingConfig: [],
      detail: "API local ou self-hosted"
    }
  ]
};

describe("TranslationWorkbench", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("runs a smoke flow and renders provider result columns", async () => {
    const translatedPatient = structuredClone(samplePatients[0]);
    translatedPatient.sourceLocale = "en-US";
    translatedPatient.allergies.medication[0].reaction =
      "severe hives and shortness of breath";

    const result: TranslationResult = {
      provider: "openai",
      translatedPatient,
      latencyMs: 123,
      warnings: [],
      glossaryHits: [
        {
          key: "penicilina",
          sourceTerm: "penicilina",
          expectedTerms: ["penicillin"],
          foundExpectedTerm: true
        }
      ],
      schemaValid: true
    };

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();

      if (url.includes("/api/providers")) {
        return Response.json(providerPayload);
      }

      return Response.json({ results: [result] });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<TranslationWorkbench patients={samplePatients} />);

    await waitFor(() => expect(screen.getByText("OpenAI LLM")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /comparar/i }));

    expect(await screen.findByText("schema ok")).toBeInTheDocument();
    expect(
      screen.getByText(/severe hives and shortness of breath/i)
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/translate",
      expect.objectContaining({ method: "POST" })
    );
  });
});
