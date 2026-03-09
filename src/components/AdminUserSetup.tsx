import { useState } from 'react';
import { Shield, UserCog, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeAdminUser } from '@/lib/initializeAdminUser';
import { toast } from '@/hooks/use-toast';

export default function AdminUserSetup() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const handleInitializeAdmin = async () => {
    setIsProcessing(true);
    
    try {
      const result = await initializeAdminUser();
      
      if (result.success) {
        setSetupComplete(true);
        toast({
          title: "Admin Setup Complete",
          description: "Admin user has been created successfully!",
          className: "bg-green-50 border-green-200"
        });
      } else {
        toast({
          title: "Setup Failed",
          description: result.error || "An error occurred during admin setup",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error initializing admin:", error);
      toast({
        title: "Setup Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">System Setup</CardTitle>
          <CardDescription>
            Initialize the admin account for Saurashtra Cycle Hub
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          {!setupComplete ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-4">
                <UserCog className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Admin Account Creation</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Creating admin account with credentials:
              </p>
              <div className="bg-secondary p-3 rounded-lg text-left text-sm font-mono mb-4">
                <p><span className="text-muted-foreground">Email:</span> admin@saurashtracyclehub.com</p>
                <p><span className="text-muted-foreground">Password:</span> Admin@2024</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: This will only create the account if it doesn't already exist.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-green-700 mb-2">Setup Complete!</h3>
              <p className="text-sm text-muted-foreground">
                Admin user has been created successfully.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col">
          {!setupComplete && (
            <Button 
              onClick={handleInitializeAdmin} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Create Admin Account
                </>
              )}
            </Button>
          )}
          
          {setupComplete && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/login'}
            >
              Proceed to Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}