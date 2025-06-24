import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor } from 'lucide-react';
import { getStands } from '@/lib/firebase';

interface Stand {
  id: string;
  number: string;
  theme: string;
  status: string;
  shelves?: Record<number, string[]>;
}

export function StandsList() {
  const [stands, setStands] = React.useState<Stand[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStands = async () => {
      try {
        const data = await getStands();
        setStands(data as Stand[]);
      } catch (error) {
        console.error('Error loading stands:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStands();
  }, []);

  const getStatusColor = (status: string) => {
    return status === 'В зале' 
      ? 'bg-green-500/20 text-green-400 border-green-500/20' 
      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Загрузка стендов...</p>
      </div>
    );
  }

  if (stands.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Стенды не найдены</p>
        <p className="text-sm text-muted-foreground mt-2">
          Добавьте первый стенд в разделе "Добавить"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stands.map((stand) => (
        <Card key={stand.id} className="cursor-pointer hover:shadow-md transition-shadow bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
                <Monitor className="h-5 w-5" />
                {stand.number}
              </CardTitle>
              <Badge className={getStatusColor(stand.status)}>
                {stand.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{stand.theme}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
