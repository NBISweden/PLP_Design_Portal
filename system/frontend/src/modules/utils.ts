

export type DataReference = {
  url: string;
}

export type DataContainer<T> = {
  data: T
}

export type DataOrReference<T> = DataReference | DataContainer<T>;

export async function fetchReference<T>(ref: string | DataOrReference<T>): Promise<T> {
  if (typeof ref === "string") {
    return await(await fetch(ref)).json();
  } else if ("url" in ref) {
    return await(await fetch(ref.url)).json();
  }
  return ref.data;
}

export function getErrorMessage(error: unknown, defaultMessage?: string): string {
  const message = error && typeof error === "object" && "message" in error && error.message;
  return typeof message === "string" ? message : defaultMessage || "An error occured";
}
