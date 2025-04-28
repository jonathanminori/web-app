import { Metadata } from "next";
import Image from "next/image";
import { Home as HomeIcon } from "lucide-react";
import { UrlForm } from "@/components/UrlForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Anonymous Redfin Listing Viewer",
  description: "Create anonymous links to Redfin listings with hidden price and address information",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <main className="max-w-2xl w-full">
        <div className="flex flex-col gap-6 items-center text-center mb-8">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Anonymous Redfin</h1>
          </div>
          <p className="text-muted-foreground max-w-lg">
            Create shareable, anonymous listings from Redfin by hiding price and address
            information while preserving photos and property details.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Anonymous Listing</CardTitle>
            <CardDescription>
              Paste a Redfin listing URL to create a shareable anonymous view.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UrlForm />
          </CardContent>
        </Card>

        <div className="mt-12 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Image 
                    src="/globe.svg" 
                    alt="Share icon" 
                    width={24} 
                    height={24} 
                    className="text-primary" 
                  />
                </div>
                <h3 className="font-medium">Share Anonymously</h3>
                <p className="text-sm text-muted-foreground">
                  Perfect for sharing listings without revealing price or location.
                </p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Image 
                    src="/window.svg" 
                    alt="Bookmark icon" 
                    width={24} 
                    height={24} 
                    className="text-primary" 
                  />
                </div>
                <h3 className="font-medium">No Login Required</h3>
                <p className="text-sm text-muted-foreground">
                  Simply bookmark the generated link to save it for later.
                </p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Image 
                    src="/file.svg" 
                    alt="Privacy icon" 
                    width={24} 
                    height={24} 
                    className="text-primary" 
                  />
                </div>
                <h3 className="font-medium">Privacy Focused</h3>
                <p className="text-sm text-muted-foreground">
                  All sensitive information is removed before sharing.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          This is an anonymous listing service. Not affiliated with Redfin.
        </p>
      </footer>
    </div>
  );
}
