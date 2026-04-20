import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListMaterials, useCreateMaterial, getListMaterialsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, FileText, Plus, ExternalLink, Upload } from "lucide-react";

export default function TeacherMaterials() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", fileUrl: "" });

  const { data: materials, isLoading } = useListMaterials();

  const createMaterial = useCreateMaterial({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMaterialsQueryKey() });
        setOpen(false);
        setForm({ title: "", fileUrl: "" });
        toast({ title: "Material uploaded!", description: "The study material is now available to students." });
      },
      onError: () => {
        toast({ title: "Upload failed", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.fileUrl) return;
    createMaterial.mutate({ data: form });
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              Study Materials
            </h1>
            <p className="text-muted-foreground mt-1">Manage and share learning resources with students.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Study Material</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Introduction to Calculus"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileUrl">File URL</Label>
                  <Input
                    id="fileUrl"
                    placeholder="https://example.com/document.pdf"
                    value={form.fileUrl}
                    onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                    required
                    type="url"
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={createMaterial.isPending}>
                  <Upload className="h-4 w-4 mr-2" />
                  {createMaterial.isPending ? "Uploading..." : "Upload Material"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading materials...</div>
        ) : (materials ?? []).length === 0 ? (
          <Card className="border">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground mb-4">No materials uploaded yet.</p>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload First Material
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(materials ?? []).map((material) => (
              <Card key={material.id} className="border hover:shadow-md transition-all group">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 truncate">{material.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">By {material.uploaderName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(material.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">PDF Resource</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
