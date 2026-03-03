import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { get } from "http";

type Props = {
	imageUrl: string;
	caption: string;
	className?: string;
	height: string;
	width: string;
	cellSize: number;
	gap: number;
};

const imageCardVariants = cva(
	"w-full overflow-hidden rounded-base border-2 border-border bg-main font-base shadow-shadow transition-all ",

	{
		variants: {
			variant: {
				default: "",
				button: "w-full overflow-hidden rounded-base border-2 border-border bg-main font-base shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none",
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
	gap,
	...props
}: Props &
	React.ComponentProps<"button"> &
	VariantProps<typeof imageCardVariants> & {
		asChild?: boolean;
	}) {
	const cardWidth = parseInt(width) * cellSize;
    
	const actualWidth = Number(width) * cellSize + (Number(width) - 1) * gap;
	const actualHeight = Number(height) * cellSize + (Number(height) - 1) * gap;
    
	const imageAspect = (actualWidth * 4) / (actualHeight * 4 - cellSize);
	return (
		<button {...props}>
			<figure
				className={cn(imageCardVariants({ variant, className }))}
				style={{
					width: actualWidth + "px",
					// height: actualHeight + "px",
				}}
			>
				<img
					className={"w-full object-cover"}
					src={imageUrl}
					alt="image"
					style={{
						aspectRatio: imageAspect,
						width: "100%",
						objectFit: "cover",
					}}
				/>
				<figcaption
					className="border-t-2 text-main-foreground border-border flex justify-start items-center px-4 py-2"
					style={{ height: cellSize / 4 - 1 }} // subtract one to account for figcaption border
				>
					{caption}
				</figcaption>
			</figure>
		</button>
	);
}
