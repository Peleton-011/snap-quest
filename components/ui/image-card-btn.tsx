import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

type Props = {
	imageUrl: string;
	caption: string;
	className?: string;
	height: string;
	width: string;
	cellSize: number;
};

const imageCardVariants = cva(
	"w-full overflow-hidden rounded-base border-2 border-border bg-main font-base shadow-shadow transition-all",

	{
		variants: {
			variant: {
				default: "",
				button: "hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export default function ImageCard({
	variant,
	imageUrl,
	caption,
	className,
	height,
	width,
	cellSize,
	...props
}: Props &
	React.ComponentProps<"button"> &
	VariantProps<typeof imageCardVariants> & {
		asChild?: boolean;
	}) {
	const w = parseInt(width);
	const h = parseInt(height);

	// Image aspect ratio: caption is 1/4 of cellSize, image gets the rest
	// aspectRatio = (W * 4) / (H * 4 - 1)
	const imageAspect = (w * 4) / (h * 4 - 1);

	return (
		<button {...props} style={{ width: "100%", height: "100%" }}>
			<figure
				className={cn(imageCardVariants({ variant, className }))}
				style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
			>
				<img
					className="w-full object-cover"
					src={imageUrl}
					alt="image"
					style={{
						aspectRatio: imageAspect,
						width: "100%",
						objectFit: "cover",
						flex: "1 1 auto",
						minHeight: 0,
					}}
				/>
				<figcaption
					className="border-t-2 text-main-foreground border-border p-4"
					style={{ height: cellSize / 4, flex: "0 0 auto" }}
				>
					{caption}
				</figcaption>
			</figure>
		</button>
	);
}
