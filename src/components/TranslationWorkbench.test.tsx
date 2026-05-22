import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("allows creating a new patient for manual testing", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();

      if (url.includes("/api/providers")) {
        return Response.json(providerPayload);
      }

      return Response.json({ results: [] });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<TranslationWorkbench patients={samplePatients} />);

    const nameInput = screen.getByPlaceholderText(/nome completo/i);
    const createButton = screen.getByRole("button", { name: /criar paciente/i });
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Paciente Teste Manual");
    await userEvent.click(createButton);

    expect(
      await screen.findByRole("option", { name: /paciente teste manual/i })
    ).toBeInTheDocument();
  });

  it("allows editing selected patient data", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();

      if (url.includes("/api/providers")) {
        return Response.json(providerPayload);
      }

      return Response.json({ results: [] });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<TranslationWorkbench patients={samplePatients} />);

    const editor = await screen.findByLabelText(/dados completos/i);
    const payload = JSON.parse((editor as HTMLTextAreaElement).value);
    payload.name = "Marina Alves Atualizada";
    payload.profile.nationality = "portuguesa";

    fireEvent.change(editor, {
      target: { value: JSON.stringify(payload, null, 2) }
    });

    await userEvent.click(screen.getByRole("button", { name: /salvar edição/i }));

    expect(
      await screen.findByRole("option", { name: /marina alves atualizada/i })
    ).toBeInTheDocument();
    expect(screen.getByText("portuguesa")).toBeInTheDocument();
  });
});
