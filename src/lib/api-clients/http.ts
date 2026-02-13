export async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 8_000);

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Upstream error ${response.status}: ${response.statusText}`);
    }

    const payload = (await response.json()) as T;
    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Upstream request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
