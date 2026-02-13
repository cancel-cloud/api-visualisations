export type DemoSlug =
  | "countries-bar"
  | "countries-bubble"
  | "weather-line"
  | "weather-radar"
  | "crypto-candlestick-like"
  | "crypto-donut"
  | "mixed-combo"
  | "style-lab";

export type LibraryId = "chartjs" | "recharts" | "echarts";

export type ChartDatasetKey = "countries" | "weather" | "crypto" | "composite" | "coffee";

export type LibraryRoute = {
  library: LibraryId;
  chart: string;
};

export type ChartStylePreset = "minimal" | "bold" | "editorial";

export type SortOrder = "asc" | "desc";

export type ApiError = {
  message: string;
  details?: string;
};

export type ApiEnvelope<T> = {
  source: string;
  lastUpdated: string;
  data: T[];
  meta: {
    total: number;
    filters: Record<string, string | number>;
  };
  error?: ApiError;
};

export type CountryMetric = {
  name: string;
  region: string;
  population: number;
  area: number;
  density: number;
};

export type WeatherPoint = {
  time: string;
  temperature_2m: number;
  precipitation_probability: number;
};

export type CryptoMetric = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
};

export type CoffeeCheckin = {
  id: string;
  createdAt: string;
  boardId: string;
  boardName: "Coffee";
  isEspresso: boolean;
  gapToPrevSeconds: number | null;
};

export type BaseDatasetBundle = {
  countries: CountryMetric[];
  weather: WeatherPoint[];
  crypto: CryptoMetric[];
  coffee: CoffeeCheckin[];
};

export type TableColumn<T> = {
  key: keyof T | string;
  label: string;
  format?: (value: unknown, row: T) => string;
};

export type ControlOption = {
  label: string;
  value: string;
};

export type SelectControl = {
  key: string;
  kind: "select";
  label: string;
  value: string;
  options: ControlOption[];
};

export type RangeControl = {
  key: string;
  kind: "range";
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
};

export type ControlField = SelectControl | RangeControl;

export type ChartControlSchema = {
  key: "limit" | "order" | "theme" | "metric";
  label: string;
  kind: "select" | "range";
  options?: ControlOption[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string | number;
};

export type LibraryChartDefinition = {
  slug: string;
  title: string;
  description: string;
  dataset: ChartDatasetKey;
  controls: ChartControlSchema[];
};

export type LibraryIndexDefinition = {
  id: LibraryId;
  title: string;
  subtitle: string;
  accent: string;
  charts: LibraryChartDefinition[];
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type SeriesPoint = {
  label: string;
  value: number;
  secondary?: number;
};
