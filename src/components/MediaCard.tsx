import { getImageUrl } from '@/lib/jellyfin';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface MediaItem {
  Id: string;
  Name: string;
  Type: 'Movie' | 'Series' | 'MusicAlbum';
  ImageTags: {
    Primary: string;
  };
}

interface MediaCardProps {
  item: MediaItem;
}

const MediaCard = ({ item }: MediaCardProps) => {
  const imageUrl = item.ImageTags.Primary
    ? getImageUrl(item.Id, item.ImageTags.Primary, 'Primary')
    : 'https://via.placeholder.com/300x450';

  return (
    <Link to={`/item/${item.Id}`} className="group">
      <Card className="overflow-hidden border-0 shadow-lg transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-primary/20">
        <CardContent className="p-0">
          <div className="aspect-[2/3] w-full">
            <img src={imageUrl} alt={item.Name} className="h-full w-full object-cover" />
          </div>
        </CardContent>
      </Card>
      <p className="mt-2 text-sm font-medium truncate transition-colors group-hover:text-primary">{item.Name}</p>
    </Link>
  );
};

export default MediaCard;
