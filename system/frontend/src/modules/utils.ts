

export type DataReference = {
  url: string;
}

export type DataContainer<T> = {
  data: T
}

export type DataOrReference<T> = DataReference | DataContainer<T>;

export async function fetchOrDefault<T>(path: string | undefined, defaultData: T): Promise<T> {
  if (path) {
    try {
      const config = await(await fetch(path)).json();
      return config;
    } catch (_e) {}
  }
  return defaultData;
}

export async function fetchReference<T>(ref: string | DataOrReference<T>): Promise<T> {
  if (typeof ref === "string") {
    return await(await fetch(ref)).json();
  } else if ("url" in ref) {
    return await(await fetch(ref.url)).json();
  }
  return ref.data;
}
