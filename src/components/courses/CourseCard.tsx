import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { courseImage } from "@/lib/course-images";
import { formatKz } from "@/lib/format";

type Props = {
  slug: string;
  title: string;
  shortDescription: string;
  duration: string;
  modality: string;
  price: number | string;
};

export function CourseCard({ slug, title, shortDescription, duration, modality, price }: Props) {
  return (
    <article className="card-elevated flex flex-col overflow-hidden">
      <img
        src={courseImage(slug)}
        alt={`Curso de ${title}`}
        loading="lazy"
        width={1280}
        height={800}
        className="h-44 w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-bold text-primary">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{shortDescription}</p>

        <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-accent" />
            {duration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-accent" />
            {modality}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
          <span className="font-display text-lg font-bold text-primary">{formatKz(price)}</span>
          <Button asChild size="sm" variant="outline">
            <Link to="/cursos/$slug" params={{ slug }}>
              Ver curso
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
