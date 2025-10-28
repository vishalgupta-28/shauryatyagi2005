import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, Lock, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-3xl flex items-center justify-center shadow-2xl">
            <MessageSquare className="w-10 h-10 text-primary-foreground" />
          </div>

          {/* Hero Text */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
              AI Chat Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Your intelligent conversation partner powered by advanced AI. 
              Get instant answers, creative ideas, and thoughtful discussions.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 flex-wrap justify-center">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-lg px-8"
            >
              Get Started
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              size="lg"
              className="text-lg px-8"
            >
              Sign In
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 w-full mt-16">
            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Get instant responses powered by cutting-edge AI technology
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your conversations are encrypted and stored securely
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Chat History</h3>
              <p className="text-muted-foreground">
                Access all your previous conversations anytime, anywhere
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
