import { Link, NavLink } from 'react-router-dom';
import { Clapperboard, LogOut } from 'lucide-react';
import useAuthStore from '@/store/auth';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Clapperboard className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Jellyfin</span>
        </Link>
        <nav className="hidden items-center space-x-6 md:flex">
          <NavLink to="/" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>Home</NavLink>
          <NavLink to="/movies" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>Movies</NavLink>
          <NavLink to="/shows" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>TV Shows</NavLink>
          <NavLink to="/music" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>Music</NavLink>
        </nav>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{user.Name}</span>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
