export type Audit = {
  score?: null | number;
  displayMode: string;
  title: string;
  description: string;
};

export type Audits = {
  [x: string]: Audit;
};

export type Category = {
  title: string;
  score: number;
};

export type Categories = {
  [x: string]: Category;
};

export type LighthouseResult = {
  audits?: Audits;
  categories?: Categories;
};

export type LighthouseLiveResponse = {
  tasks?:
    | null
    | {
        result: LighthouseResult[];
      }[];
};
