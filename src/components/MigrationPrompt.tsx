import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { migrateLocalStorageToDatabase } from '@/utils/localStorageMigration';
import { Loader2, Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MigrationPromptProps {
  userId: string;
  onComplete: () => void;
}

export default function MigrationPrompt({ userId, onComplete }: MigrationPromptProps) {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    migratedCount: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const migrationResult = await migrateLocalStorageToDatabase(userId);
      setResult(migrationResult);

      if (migrationResult.success) {
        toast({
          title: 'Migration Complete!',
          description: `Successfully migrated ${migrationResult.migratedCount} notes to the cloud.`,
        });
        setTimeout(onComplete, 2000);
      } else {
        toast({
          title: 'Migration Partial',
          description: `Migrated ${migrationResult.migratedCount} notes with ${migrationResult.errors.length} errors.`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Migration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setMigrating(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`migration_completed_${userId}`, 'true');
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <CardTitle>Migrate Your Notes to the Cloud</CardTitle>
          </div>
          <CardDescription>
            We've detected notes in your local storage. Migrate them to the cloud for enhanced features,
            sync across devices, and AI-powered insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your local notes will be safely backed up and migrated to a new "Migrated Notes" collection.
                  This process is safe and won't delete your original data.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  onClick={handleMigrate}
                  disabled={migrating}
                  className="flex-1"
                >
                  {migrating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Migrate Notes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  disabled={migrating}
                >
                  Skip for Now
                </Button>
              </div>
            </>
          )}

          {result && (
            <>
              <Alert className={result.success ? 'border-green-500' : 'border-yellow-500'}>
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <AlertDescription>
                  {result.success ? (
                    <>Successfully migrated {result.migratedCount} notes!</>
                  ) : (
                    <>
                      Migrated {result.migratedCount} notes with {result.errors.length} errors.
                      Check console for details.
                    </>
                  )}
                </AlertDescription>
              </Alert>

              {result.errors.length > 0 && (
                <div className="bg-muted p-4 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-sm font-medium mb-2">Errors:</p>
                  <ul className="text-xs space-y-1">
                    {result.errors.map((error, i) => (
                      <li key={i} className="text-destructive">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={onComplete} className="w-full">
                Continue to App
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
