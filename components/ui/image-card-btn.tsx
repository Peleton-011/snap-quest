import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { get } from "http";

type Props = {
	imageUrl: string;
	caption: string;
	className?: string;
	height?: string;
	width?: string;
};

const imageCardVariants = cva(
	"w-[250px] overflow-hidden rounded-base border-2 border-border bg-main font-base shadow-shadow transition-all ",

	{
		variants: {
			variant: {
				default: "",
				button: "w-[250px] overflow-hidden rounded-base border-2 border-border bg-main font-base shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none",
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
	...props
}: Props &
	React.ComponentProps<"button"> &
	VariantProps<typeof imageCardVariants> & {
		asChild?: boolean;
	}) {
	const cellSize = 250;
	const cellGap = 20;
	function getWidthCSS(width: string) {
		const w = cellSize + (parseInt(width) - 1) * (cellSize + cellGap);

		return {
			width: `${w}px`,
		};
	}

	function getHeightCSS(height: string) {
		const h =
			(cellSize * 3) / 4 + (parseInt(height) - 1) * (cellSize + cellGap);
		return {
			height: `${h}px`,
		};
	}

	return (
		<button {...props}>
			<figure
				className={cn(imageCardVariants({ variant, className }))}
				style={getWidthCSS(width || "1")}
			>
				<img
					className={"w-full object-cover"}
					style={getHeightCSS(height || "1")}
					src={imageUrl}
					alt="image"
				/>
				<figcaption className="border-t-2 text-main-foreground border-border p-4">
					{caption}
				</figcaption>
			</figure>
		</button>
	);
}
