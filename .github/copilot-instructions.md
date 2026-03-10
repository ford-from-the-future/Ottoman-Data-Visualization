# Copilot Instructions

## Project Overview

This project is a **general-purpose data visualization tool** that renders any structured data in the style of **Cerîde-i Adliyye** (The Journal of Justice) — an official Ottoman gazette published by the Ministry of Justice that recorded legal proceedings, court decisions, and judicial appointments.

The core idea: **anyone should be able to feed in data of any kind** — a spreadsheet of court cases, a list of appointments, a dataset of transactions, census records, or any other tabular or structured information — and the tool will present it through the visual and typographic language of the Cerîde-i Adliyye. The content is user-supplied; the presentation is always faithful to the gazette's aesthetic.

## Inspiration

This project was inspired by the [Poetic Justice](https://casualarchivist.substack.com/p/poetic-justice) article on Casual Archivist, which explores the Cerîde-i Adliyye as a historical source and highlights the value of making its data accessible and visually compelling.

## Goals

- Accept arbitrary structured data from users (CSV, JSON, spreadsheets, or other common formats) with no assumptions about the subject matter.
- Map user-supplied fields onto the gazette's visual structure — columns, entries, headings, and typographic hierarchy — in a flexible, configurable way.
- Display any dataset in a visual style faithful to the aesthetic of Cerîde-i Adliyye.
- Make the rendered output searchable, browsable, and legible to a modern audience.
- Respect the historical and cultural context of the gazette's original form while making the tool universally accessible.

## Guidelines for Copilot

- **Design for generic, user-supplied data first.** Never assume the data is Ottoman or judicial in nature; the pipeline must handle arbitrary fields and schemas.
- Provide clear data ingestion interfaces (e.g., file upload, paste, API) that accept common formats without requiring domain knowledge.
- Keep code modular and well-documented so that contributors unfamiliar with Ottoman history can still understand the data pipeline and rendering logic.
- When generating UI components, prefer layouts and typography that evoke the look of historical Ottoman print publications (e.g., structured columns, formal typographic hierarchy).
- Field mapping between user data and gazette layout should be explicit and configurable, not hard-coded to any specific schema.
- Use clear, descriptive variable and function names that separate concerns: data ingestion/transformation on one side, gazette-style rendering on the other.
- Avoid anachronistic terminology; prefer neutral, scholarly language when naming things related to the gazette's visual style.
- Tests should cover both data-processing logic (including varied input schemas) and, where applicable, rendering behavior.
