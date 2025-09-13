import { ArrowLeft, Upload, Video, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const MediaUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && title) {
      // Here you would typically upload to your storage solution
      console.log("Uploading:", { file: selectedFile, title, description });
      alert("Media uploaded successfully!");
      setSelectedFile(null);
      setTitle("");
      setDescription("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/teacher-chat">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Media</h1>
            <p className="text-gray-600">Upload videos and photos for Devadar Media</p>
          </div>
        </div>

        {/* Upload Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="media-file">Select Video or Photo</Label>
              <Input
                id="media-file"
                type="file"
                accept="video/*,image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {selectedFile.type.startsWith('video/') ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                  {selectedFile.name}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter media title"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter media description"
                rows={3}
              />
            </div>

            {/* Upload Button */}
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || !title}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {selectedFile && (
          <Card className="mt-8 shadow-lg">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                {selectedFile.type.startsWith('video/') ? (
                  <video
                    src={URL.createObjectURL(selectedFile)}
                    controls
                    className="max-w-full max-h-full rounded-lg"
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="max-w-full max-h-full rounded-lg object-contain"
                  />
                )}
              </div>
              {title && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  {description && <p className="text-gray-600 mt-1">{description}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MediaUpload;