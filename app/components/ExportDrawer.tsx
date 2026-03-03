"use client";

import { Share2, FileImage, FileText, Images, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";

interface ExportDrawerProps {
	onShareStory: () => void;
	onShareCarousel: () => void;
	onDownloadPDF: () => void;
	onDownloadImages: () => void;
	isGeneratingStory: boolean;
	isGeneratingCarousel: boolean;
	isGeneratingPDF: boolean;
	isDownloadingImages: boolean;
	hasCompletedTiles: boolean;
}

export default function ExportDrawer({
	onShareStory,
	onShareCarousel,
	onDownloadPDF,
	onDownloadImages,
	isGeneratingStory,
	isGeneratingCarousel,
	isGeneratingPDF,
	isDownloadingImages,
	hasCompletedTiles,
}: ExportDrawerProps) {
	const isBusy =
		isGeneratingStory ||
		isGeneratingCarousel ||
		isGeneratingPDF ||
		isDownloadingImages;

	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button
					size="icon"
					className="fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-shadow"
				>
					<Share2 className="!size-6" />
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Share &amp; Export</DrawerTitle>
					<DrawerDescription>
						Share your SnapQuest or download it for later.
					</DrawerDescription>
				</DrawerHeader>
				<div className="flex flex-col gap-3 px-4">
					<Button
						onClick={onShareStory}
						disabled={isGeneratingStory || !hasCompletedTiles}
					>
						{isGeneratingStory ? (
							<Loader2 className="animate-spin" />
						) : (
							<FileImage />
						)}
						{isGeneratingStory ? "Generating..." : "Share Story"}
					</Button>
					<Button
						onClick={onShareCarousel}
						disabled={isGeneratingCarousel || !hasCompletedTiles}
					>
						{isGeneratingCarousel ? (
							<Loader2 className="animate-spin" />
						) : (
							<Images />
						)}
						{isGeneratingCarousel
							? "Generating..."
							: "Share Cards"}
					</Button>
					<Button
						onClick={onDownloadPDF}
						disabled={isGeneratingPDF}
					>
						{isGeneratingPDF ? (
							<Loader2 className="animate-spin" />
						) : (
							<FileText />
						)}
						{isGeneratingPDF
							? "Generating PDF..."
							: "Download PDF"}
					</Button>
					<Button
						variant="neutral"
						onClick={onDownloadImages}
						disabled={isDownloadingImages}
					>
						{isDownloadingImages ? (
							<Loader2 className="animate-spin" />
						) : (
							<Images />
						)}
						{isDownloadingImages
							? "Downloading..."
							: "Download Images"}
					</Button>
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button variant="noShadow" disabled={isBusy}>
							Close
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
