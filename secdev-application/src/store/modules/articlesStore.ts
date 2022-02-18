import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axios } from '../../services/axios';
import {
  ArticlesInitialState,
  ArticleData,
} from '../../types/modules/article.type';
import { EventsFilters } from '../../types/modules/eventsFilters.type';

const articlesIntialState: ArticlesInitialState = {
  status: 'idle',
  error: false,
  loaded: false,
  articles: [],
};

export const fetchArticles = createAsyncThunk(
  'articles',
  async (data: EventsFilters) => {
    const { start_date, end_date, language } = data;
    const apiUrl = `${process.env.REACT_APP_ENDPOINT_URL}get-articles/${start_date}/${end_date}/${language}`;
    const response = await axios.get(apiUrl, {
      params: {
        commune_id: data.commune_id > 0 ? data.commune_id : undefined,
        event_id: data.event_id > 0 ? data.event_id : undefined,
      },
    });
    const result = transformArticlesResult(response.data.data);

    return result;
  },
);

const transformArticlesResult = (articles: any) => {
  const transformedArticles: ArticleData[] = [];
  articles.map((article: any) => {
    const transformedArticle: ArticleData = {
      eventInfoId: article.event_info_id,
      publicationDate: article.publication_date,
      source: article.source,
      title: article.title,
      url: article.url,
      summary: article.summary,
      tone: article.tone,
      compound: article.compound,
      communeId: article.commune_id,
      language: article.language,
      category: article.category,
      eventType: article.event_type,
    };

    return transformedArticles.push(transformedArticle);
  });

  return transformedArticles;
};

const articlesSlice = createSlice({
  name: 'articles',
  initialState: articlesIntialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchArticles.pending, state => {
      state.status = 'Loading';
      state.loaded = false;
      state.error = false;
    });
    builder.addCase(fetchArticles.fulfilled, (state, { payload }) => {
      state.status = 'Loaded';
      state.error = false;
      state.articles = payload;
      state.loaded = true;
    });
    builder.addCase(fetchArticles.rejected, state => {
      state.error = true;
      state.loaded = false;
      state.status = 'Error Fetching Articles Data';
    });
  },
});

export default articlesSlice.reducer;
