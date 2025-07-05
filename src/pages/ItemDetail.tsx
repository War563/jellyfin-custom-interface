import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getItem, getImageUrl } from '@/lib/jellyfin';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayCircle, Star, Calendar, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ItemDetails {
  Id: string;
  Name: string;
  Type: 'Movie' | 'Series';
  Overview: string;
  Genres: string[];
  ProductionYear: number;
  CommunityRating?: number;
  OfficialRating?: string;
  RunTimeTicks?: number;
  ImageTags: {
    Primary: string;
  };
  BackdropImageTags: string[];
  People: {
    Name: string;
    Id: string;
    Role: string;
    Type: 'Actor';
    PrimaryImageTag?: string;
  }[];
}

const formatRuntime = (ticks?: number) => {
  if (!ticks) return '';
  const totalMinutes = ticks / 10000000 / 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${hours}h ${minutes}m`;
};

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const itemData = await getItem(id);
        setItem(itemData);
      } catch (err) {
        console.error('Failed to fetch item details:', err);
        setError('Could not load item details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  const backdropUrl = item?.BackdropImageTags?.[0]
    ? getImageUrl(item.Id, item.BackdropImageTags[0], 'Backdrop')
    : 'https://via.placeholder.com/1920x1080/000000/000000?Text=';
  
  const posterUrl = item?.ImageTags?.Primary
    ? getImageUrl(item.Id, item.ImageTags.Primary, 'Primary')
    : 'https://via.placeholder.com/300x450';

  if (loading) {
    return (
      <div>
        <Skeleton className="h-[50vh] w-full" />
        <div className="container mx-auto -mt-32 px-4 pb-16">
          <div className="flex flex-col gap-8 md:flex-row">
            <Skeleton className="aspect-[2/3] w-full max-w-[250px] rounded-lg shadow-2xl" />
            <div className="flex-1 pt-36">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="mt-4 h-6 w-1/2" />
              <Skeleton className="mt-4 h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return <div className="container mx-auto p-8 text-center text-destructive">{error}</div>;
  }

  const actors = item.People.filter(p => p.Type === 'Actor');

  return (
    <div className="text-white">
      {/* Backdrop */}
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <img src={backdropUrl} alt={`${item.Name} backdrop`} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto -mt-24 md:-mt-32 px-4 pb-16">
        <div className="relative flex flex-col gap-8 md:flex-row">
          {/* Poster */}
          <div className="w-full max-w-[200px] md:max-w-[250px] flex-shrink-0">
            <img src={posterUrl} alt={`${item.Name} poster`} className="aspect-[2/3] w-full rounded-lg object-cover shadow-2xl" />
          </div>

          {/* Details */}
          <div className="flex-1 pt-24 md:pt-36">
            <h1 className="text-3xl md:text-5xl font-extrabold">{item.Name}</h1>
            
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
              {item.ProductionYear && <span className="flex items-center gap-2"><Calendar size={16} /> {item.ProductionYear}</span>}
              {item.OfficialRating && <Badge variant="outline">{item.OfficialRating}</Badge>}
              {item.RunTimeTicks && <span className="flex items-center gap-2"><Clock size={16} /> {formatRuntime(item.RunTimeTicks)}</span>}
              {item.CommunityRating && <span className="flex items-center gap-2"><Star size={16} className="text-yellow-400" /> {item.CommunityRating.toFixed(1)}</span>}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.Genres.map(genre => <Badge key={genre} variant="secondary">{genre}</Badge>)}
            </div>

            <p className="mt-6 max-w-3xl text-lg leading-relaxed">{item.Overview}</p>

            <div className="mt-8">
              <Button size="lg">
                <PlayCircle className="mr-2 h-6 w-6" />
                Play
              </Button>
            </div>
          </div>
        </div>

        {/* Cast */}
        {actors.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {actors.slice(0, 12).map(actor => (
                <div key={actor.Id} className="text-center">
                  <Avatar className="h-24 w-24 mx-auto">
                    {actor.PrimaryImageTag && <AvatarImage src={getImageUrl(actor.Id, actor.PrimaryImageTag, 'Primary')} />}
                    <AvatarFallback>{actor.Name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="mt-2 font-semibold">{actor.Name}</p>
                  <p className="text-sm text-muted-foreground">{actor.Role}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;
