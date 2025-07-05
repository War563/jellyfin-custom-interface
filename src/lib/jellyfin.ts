import axios from 'axios';
import useAuthStore from '@/store/auth';

const getHeaders = () => {
  const { token } = useAuthStore.getState();
  return {
    'Content-Type': 'application/json',
    'X-Emby-Authorization': `MediaBrowser Token="${token}"`,
  };
};

const getApiClient = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
  });

  instance.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers['X-Emby-Authorization'] = `MediaBrowser Token="${token}"`;
    }
    return config;
  });

  return instance;
};

export const authenticate = async (serverUrl: string, username?: string, password?: string) => {
  const apiClient = getApiClient(serverUrl);
  const response = await apiClient.post('/Users/AuthenticateByName', {
    Username: username,
    Pw: password,
  }, {
    headers: {
      'X-Emby-Authorization': 'MediaBrowser Client="Jellyfin Web", Device="Web", DeviceId="bolt-jellyfin-client", Version="10.8.13"',
    }
  });
  return response.data;
};

export const getMediaLibraries = async () => {
  const { serverUrl } = useAuthStore.getState();
  const apiClient = getApiClient(serverUrl!);
  const response = await apiClient.get('/Library/MediaFolders');
  return response.data;
};

export const getItems = async (parentId: string) => {
  const { serverUrl, user } = useAuthStore.getState();
  const apiClient = getApiClient(serverUrl!);
  const response = await apiClient.get(`/Users/${user?.Id}/Items`, {
    params: {
      ParentId: parentId,
      IncludeItemTypes: 'Movie,Series,MusicAlbum',
      Recursive: true,
      Fields: 'PrimaryImageAspectRatio,BasicSyncInfo',
      ImageTypeLimit: 1,
      EnableImageTypes: 'Primary,Backdrop,Banner,Thumb',
    },
  });
  return response.data;
};

export const getLatestItems = async (parentId: string) => {
    const { serverUrl, user } = useAuthStore.getState();
    const apiClient = getApiClient(serverUrl!);
    const response = await apiClient.get(`/Users/${user?.Id}/Items/Latest`, {
        params: {
            ParentId: parentId,
            IncludeItemTypes: 'Movie,Series,MusicAlbum',
            Limit: 20,
            Fields: 'PrimaryImageAspectRatio,BasicSyncInfo',
            ImageTypeLimit: 1,
            EnableImageTypes: 'Primary,Backdrop,Banner,Thumb',
        },
    });
    return response.data;
};


export const getItem = async (itemId: string) => {
  const { serverUrl, user } = useAuthStore.getState();
  const apiClient = getApiClient(serverUrl!);
  const response = await apiClient.get(`/Users/${user?.Id}/Items/${itemId}`);
  return response.data;
};

export const getImageUrl = (itemId: string, tag: string, type: 'Primary' | 'Backdrop' | 'Banner' | 'Thumb' = 'Primary') => {
  const { serverUrl } = useAuthStore.getState();
  return `${serverUrl}/Items/${itemId}/Images/${type}?tag=${tag}&quality=90`;
};
