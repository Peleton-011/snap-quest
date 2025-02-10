# SnapQuest

SnapQuest is an engaging and interactive photo scavenger hunt game where players receive a set of prompts and capture images to match them. The game allows users to explore, be creative, and have fun while taking pictures. Users can later export their photos in a PDF or as a ZIP file for easy sharing and saving.

## Features

- **Fast & Responsive UI**: Built with Next.js and React, ensuring a smooth user experience.
- **Multilingual Support**: Prompts and interface elements adapt based on the selected language.
- **Interactive Mosaic Grid**: Dynamic layout adjusts based on image orientation for a visually appealing gallery.
- **Camera & Upload Support**: Capture photos directly or upload existing ones.
- **Export Options**: Generate a PDF or ZIP archive of all captured images.
- **Database Integration**: Stores prompts and user submissions efficiently using MongoDB.
- **Sleek Dark Mode UI**: Designed for readability and style, following modern UI/UX trends.
- **Optimized & Maintainable Codebase**: Clean and structured codebase for scalability and future development.

## Technologies Used

- **Frontend**: React (Next.js), TypeScript, Material-UI
- **Backend**: Next.js API Routes, MongoDB
- **Styling**: CSS Modules, Global Styles (Dark Theme)
- **Data Management**: MongoDB for prompts, IndexedDB (Dexie) for local storage
- **Utilities**: PDF-lib (for PDF generation), JSZip (for ZIP exports), Axios (API requests)

## Setup Instructions

### Prerequisites
- Node.js (>=16.0)
- MongoDB instance (for storing prompts)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/snapquest.git
   cd snapquest
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```sh
   MONGODB_URI=your_mongodb_connection_string
   ```
4. Run the development server:
   ```sh
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

## Usage

1. **Select a Prompt Set**: Choose a themed challenge from the dropdown.
2. **Take or Upload Photos**: Click on a prompt tile to open the camera modal and snap a picture or upload one.
3. **Complete Your Grid**: As you take pictures, your mosaic fills up dynamically.
4. **Export Your Collection**: Download your photos as a PDF or ZIP file.

## Future Enhancements
- Social sharing features.
- AI-based image recognition for better prompt validation.
- Mobile app version for iOS & Android.

---

SnapQuest is a fun way to challenge your creativity and photography skills. Try it today and start snapping!

