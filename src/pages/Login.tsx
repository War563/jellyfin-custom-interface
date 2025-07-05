import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clapperboard, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const { login, serverUrl: storedServerUrl } = useAuthStore();
  const [serverUrl, setServerUrl] = useState(storedServerUrl || import.meta.env.VITE_JELLYFIN_URL || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(serverUrl, username, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with an error status (4xx, 5xx)
          setError(`Login failed. Server responded with status ${err.response.status}. Please check your credentials.`);
        } else if (err.request) {
          // Request was made, but no response received (e.g., network error, CORS)
          setError('Could not connect to server. Please check the URL and ensure your Jellyfin server allows requests from this page (CORS).');
        } else {
          // Other errors
          setError(`An unexpected error occurred: ${err.message}`);
        }
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Clapperboard className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Jellyfin</CardTitle>
          <CardDescription>Sign in to your Jellyfin server</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Login Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="serverUrl">Server URL</Label>
              <Input
                id="serverUrl"
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="http://jellyfin.example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
