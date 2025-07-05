import { useEffect, useState } from 'react';
import { getMediaLibraries, getLatestItems, getImageUrl } from '@/lib/jellyfin';
import MediaCard from '@/components/MediaCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

interface MediaItem {
  Id: string;
  Name: string;
  Type: 'Movie' | 'Series' | 'MusicAlbum';
  ImageTags: {
    Primary: string;
    Backdrop: string;
  };
  BackdropImageTags: string[];
}

interface Library {
  Name: string;
  ItemId: string;
  CollectionType: 'movies' | 'tvshows' | 'music';
}

const Home = () => {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [libraryItems, setLibraryItems] = useState<Record<string, MediaItem[]>>({});
  const [featuredItem, setFeaturedItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const mediaLibraries = await getMediaLibraries();
        const libs = mediaLibraries.Items.filter((item: any) => ['movies', 'tvshows'].includes(item.CollectionType));
        setLibraries(libs);

        const allItems: MediaItem[] = [];
        const itemsByLibrary: Record<string, MediaItem[]> = {};

        for (const lib of libs) {
          const items = await getLatestItems(lib.ItemId);
          itemsByLibrary[lib.Name] = items;
          allItems.push(...items);
        }
        setLibraryItems(itemsByLibrary);

        if (allItems.length > 0) {
          const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
          setFeaturedItem(randomItem);
        }
      } catch (error) {
        console.error('Failed to fetch media:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const featuredImageUrl = featuredItem?.BackdropImageTags?.[0]
    ? getImageUrl(featuredItem.Id, featuredItem.BackdropImageTags[0], 'Backdrop')
    : 'https://via.placeholder.com/1920x1080';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-[50vh] w-full rounded-lg" />
        <div className="mt-8">
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {featuredItem && (
        <div className="relative h-[60vh] w-full">
          <img src={featuredImageUrl} alt={featuredItem.Name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end container mx-auto px-4 pb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg">{featuredItem.Name}</h1>
            <p className="mt-2 text-lg text-white/80 max-w-2xl drop-shadow-md">
              {featuredItem.Type === 'Movie' ? 'A thrilling movie experience.' : 'An exciting series to binge.'}
            </p>
            <div className="mt-6">
              <Button size="lg">
                <PlayCircle className="mr-2 h-6 w-6" />
                Play
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 space-y-8">
        {libraries.map((lib) => (
          <section key={lib.ItemId}>
            <h2 className="text-2xl font-bold mb-4">{lib.Name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {libraryItems[lib.Name]?.map((item) => (
                <MediaCard key={item.Id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Home;
