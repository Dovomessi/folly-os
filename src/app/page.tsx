import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Folly OS</h1>
            <p className="text-sm text-slate-500">Dashboard personnel unifié</p>
          </div>
          <Badge variant="outline" className="text-xs">v0.1.0</Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="projects">Projets</TabsTrigger>
            <TabsTrigger value="calendar">RDV & Agenda</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="passwords">Passwords</TabsTrigger>
          </TabsList>

          <Separator className="my-4" />

          {/* Projects Tab - Plane Integration */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Projets</CardTitle>
                <CardDescription>
                  Intégration Plane - Tâches, Kanban, Suivi de projet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-slate-500 mb-2">Plane Integration</p>
                    <p className="text-sm text-slate-400">
                      Configuration requise : URL Plane + API Key
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab - Someday Integration */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Rendez-vous & Agenda</CardTitle>
                <CardDescription>
                  Intégration Someday - Booking de créneaux, Calendly-like
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-slate-500 mb-2">Someday Integration</p>
                    <p className="text-sm text-slate-400">
                      Configuration requise : URL Someday + API Key
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab - Docmost Integration */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes & Wiki</CardTitle>
                <CardDescription>
                  Intégration Docmost - Documentation, Notes collaboratives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-slate-500 mb-2">Docmost Integration</p>
                    <p className="text-sm text-slate-400">
                      Configuration requise : URL Docmost + API Key
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Passwords Tab - Padloc Integration */}
          <TabsContent value="passwords">
            <Card>
              <CardHeader>
                <CardTitle>Gestionnaire de Mots de Passe</CardTitle>
                <CardDescription>
                  Intégration Padloc - Vault chiffré, style 1Password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-slate-500 mb-2">Padloc Integration</p>
                    <p className="text-sm text-slate-400">
                      Configuration requise : Instance Padloc + Clé maître
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
