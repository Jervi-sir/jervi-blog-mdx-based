import { Github, Instagram, Linkedin } from "lucide-react"; // Music = TikTok
import Link from "next/link";

interface SocialCardProps {
  name: string;
  url: string;
  icon: React.ReactNode;
  username: string;
}

function SocialCard({ name, url, icon, username }: SocialCardProps) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors group"
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-card-foreground">{name}</span>
        <span className="text-sm text-muted-foreground">{username}</span>
      </div>
    </Link>
  );
}

export function SocialCards() {
  return (
    <div className="space-y-4">
      
      <SocialCard
        name="GitHub"
        url="https://github.com/Jervi-sir"
        icon={<Github className="w-5 h-5" />}
        username="Jervi-sir"
      />
      <SocialCard
        name="TikTok"
        url="https://www.tiktok.com/@what_jervi_thinks_of_dz"
        icon={
          <div className="flex justify-center items-center">
            <span className="text-center">TT</span>
          </div>
        }
        username="@what_jervi_thinks_of_dz"
      />
      <SocialCard
        name="Instagram"
        url="https://www.instagram.com/gacem_humen/"
        icon={<Instagram className="w-5 h-5" />}
        username="@gacem_humen"
      />
      <SocialCard
        name="LinkedIn"
        url="https://www.linkedin.com/in/gacem-bekhira/"
        icon={<Linkedin className="w-5 h-5" />}
        username="gacem-bekhira"
      />
    </div>
  );
}
