export interface ArticleData {
    eventInfoId: number;
    publicationDate: string;
    source: string;
    title: string;
    url: string;
    summary: string;
    tone: number;
    compound: number;
    communeId: number;
    language: number;
    category: string;
    eventType: string;
  }

export interface ArticlesInitialState {
  status: string;
  error: boolean;
  loaded: boolean;
  articles: ArticleData[] | [];
}