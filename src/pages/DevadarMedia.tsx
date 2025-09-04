import { ArrowLeft, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DevadarMedia = () => {
  // Featured video
  const featuredVideo = {
    id: "Uj8LClVk6_w",
    title: "Featured Video",
    description: "Latest content from Devadar Media",
    thumbnail: `https://img.youtube.com/vi/Uj8LClVk6_w/maxresdefault.jpg`
  };

  // Sample videos (in a real app, you'd fetch these from YouTube API)
  const videos = [
    {
      id: "Uj8LClVk6_w",
      title: "Featured Video",
      description: "Latest educational content from Devadar Media channel",
      thumbnail: `https://img.youtube.com/vi/Uj8LClVk6_w/hqdefault.jpg`
    },
    // Add more videos here when you integrate with YouTube API
  ];

  const openYouTubeVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Devadar Media</h1>
            <p className="text-gray-600">Educational content and videos</p>
          </div>
        </div>

        {/* Featured Video */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Featured Video</h2>
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="aspect-video relative">
                <iframe
                  src={`https://www.youtube.com/embed/${featuredVideo.id}?si=BocuPYoFP8__7FEt`}
                  title={featuredVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{featuredVideo.title}</h3>
                <p className="text-gray-600">{featuredVideo.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Videos Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">All Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openYouTubeVideo(video.id)}>
                <CardContent className="p-0">
                  <div className="aspect-video relative group">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 text-gray-900 line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{video.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* YouTube Channel Link */}
        <div className="mt-12 text-center">
          <Button 
            onClick={() => window.open('https://www.youtube.com/@devadar-media', '_blank')}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Visit Devadar Media YouTube Channel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DevadarMedia;