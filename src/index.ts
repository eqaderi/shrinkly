import axios, { AxiosResponse } from "axios";

type ShortenResponse = {
  message: string;
  short: string;
  long: string;
};

type ShortenParams = {
  long: string;
  short?: string;
};

async function shortenWith1pt(
  url: string,
  customShort?: string
): Promise<string> {
  const shorteningEndpoint =
    "https://csclub.uwaterloo.ca/~phthakka/1pt-express/addURL";

  const params: ShortenParams = {
    long: url,
  };

  if (customShort) {
    params.short = customShort;
  }

  try {
    const response: AxiosResponse<ShortenResponse> =
      await axios.post<ShortenResponse>(
        shorteningEndpoint,
        null,
        { params } // Pass params as query parameters
      );

    if (response.data && response.data.short) {
      return `https://1pt.co/${response.data.short}`;
    }

    throw new Error("Failed to shorten URL");
  } catch (error) {
    console.error("An error occurred while shortening the URL:", error);
    throw error;
  }
}

async function shortenWithCleanUri(url: string): Promise<string> {
  const cleanUriEndpoint = "https://cleanuri.com/api/v1/shorten";

  try {
    const response: AxiosResponse<{ result_url: string }> = await axios.post<{
      result_url: string;
    }>(cleanUriEndpoint, `url=${encodeURIComponent(url)}`);

    if (response.data && response.data.result_url) {
      return response.data.result_url;
    }

    throw new Error("Failed to shorten URL with CleanUri");
  } catch (error) {
    console.error(
      "An error occurred while shortening the URL with CleanUri:",
      error
    );
    throw error;
  }
}

type IsGdResponse = {
  shorturl?: string;
  errorcode?: number;
  errormessage?: string;
};
type IsgdParams = {
  url: string;
  format: "json" | "xml" | "simple" | "web";
  shorturl?: string;
  logstats?: 1;
};

async function shortenUrlWithIsgd(
  url: string,
  customShort?: string,
  format: IsgdParams["format"] = "json",
  logstats?: boolean
) {
  const apiURL = "https://is.gd/create.php";
  const params: IsgdParams = {
    url,
    format,
  };

  if (customShort) {
    params.shorturl = customShort;
  }

  if (logstats) {
    params.logstats = 1;
  }

  try {
    const response = await axios.get<IsGdResponse>(apiURL, { params });
    if (response.data.shorturl) {
      return response.data.shorturl;
    } else {
      throw new Error(
        response.data.errormessage || "Failed to shorten URL with IsGd"
      );
    }
  } catch (error) {
    return `Error: ${(error as Error).message}`;
  }
}

type ShorteningService = "1pt" | "cleanuri" | "isgd";
type ShorteningFunction = (
  url: string,
  customShort?: string,
  format?: IsgdParams["format"],
  logstats?: boolean
) => Promise<string>;

const shortenWithService: Record<ShorteningService, ShorteningFunction> = {
  "1pt": shortenWith1pt,
  cleanuri: shortenWithCleanUri,
  isgd: shortenUrlWithIsgd,
};

export async function shortenUrl(
  url: string,
  service: ShorteningService = "isgd",
  customShort?: string
): Promise<string> {
  const shortenFunction = shortenWithService[service];

  if (shortenFunction) {
    return shortenFunction(url, customShort);
  }

  throw new Error("Unsupported shortening service");
}
