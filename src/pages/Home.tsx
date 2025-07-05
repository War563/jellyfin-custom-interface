import { useEffect, useState, useRef } from 'react';
import { getMediaLibraries, getLatestItems, getImageUrl } from '@/lib/jellyfin';
import MediaCard from '@/components/MediaCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Link } from 'react-router-dom';

interface MediaItem {
  Id: string;
  Name: string;
  Type: 'Movie' | 'Series' | 'MusicAlbum';
  ImageTags: {
    Primary: string;
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
  const [bannerItems, setBannerItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const autoplayPlugin = useRef(
    Autoplay({ delay: 6000, stopOnInteraction: false })
  );

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
          const itemsWithBackdrop = allItems.filter(item => item.BackdropImageTags && item.BackdropImageTags.length > 0);
          const shuffled = itemsWithBackdrop.sort(() => 0.5 - Math.random());
          setBannerItems(shuffled.slice(0, 7));
        }
      } catch (error) {
        console.error('Failed to fetch media:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  if (loading) {
    return (
      <div className="w-full space-y-12">
        <Skeleton className="h-[60vh] w-full rounded-none" />
        <div className="container mx-auto px-4 space-y-12">
          <div>
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="flex space-x-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[250px] w-[166px] rounded-lg shrink-0" />)}
            </div>
          </div>
          <div>
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="flex space-x-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[250px] w-[166px] rounded-lg shrink-0" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {bannerItems.length > 0 && (
        <Carousel
          plugins={[autoplayPlugin.current]}
          className="w-full"
          onMouseEnter={autoplayPlugin.current.stop}
          onMouseLeave={autoplayPlugin.current.reset}
          opts={{ loop: true }}
        >
          <CarouselContent>
            {bannerItems.map((item) => (
              <CarouselItem key={item.Id}>
                <div className="relative h-[60vh] w-full">
                  <img
                    src={getImageUrl(item.Id, item.BackdropImageTags[0], 'Backdrop')}
                    alt={item.Name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <div className="relative z-10 flex h-full flex-col justify-end container mx-auto px-4 pb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg animate-fade-in-up">{item.Name}</h1>
                    <p className="mt-2 text-lg text-white/80 max-w-2xl drop-shadow-md animate-fade-in-up animation-delay-200">
                      {item.Type === 'Movie' ? 'A thrilling movie experience.' : 'An exciting series to binge.'}
                    </p>
                    <div className="mt-6 animate-fade-in-up animation-delay-400">
                      <Link to={`/item/${item.Id}`}>
                        <Button size="lg">
                          <PlayCircle className="mr-2 h-6 w-6" />
                          Play
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 text-white bg-black/30 hover:bg-black/50 border-0 disabled:opacity-50" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 text-white bg-black/30 hover:bg-black/50 border-0 disabled:opacity-50" />
        </Carousel>
      )}

      <div className="container mx-auto px-4 space-y-12">
        {libraries.map((lib) => (
          libraryItems[lib.Name]?.length > 0 && (
            <section key={lib.ItemId}>
              <h2 className="text-3xl font-bold mb-4">{lib.Name}</h2>
              <Carousel
                opts={{
                  align: 'start',
                  dragFree: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {libraryItems[lib.Name]?.map((item) => (
                    <CarouselItem key={item.Id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-[14.28%] pl-4">
                      <MediaCard item={item} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </section>
          )
        ))}
      </div>
    </div>
  );
};

export default Home;
